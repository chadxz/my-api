var pinboardUtils = (function () {
  var iso8601 = require('iso8601');
  var redis = require('./redis');

  var pinboardApi = require('./pinboardApi');
  var pinboardApiToken = process.env['PINBOARD_API_TOKEN'];
  var pinboard = new pinboardApi.Pinboard(pinboardApiToken);

  var pinboardRedisKeys = {
    lastUpdated: 'pinboardLastUpdated',
    posts: 'pinboardPosts'
  };

  var pinboardRateLimits = {
    postsAll: 300000,
    postsRecent: 60000,
    defaultLimit: 3000
  }

  /**
   * Converts milliseconds to seconds.
   *
   * @param {number} ms Milliseconds to convert
   * @returns {number}
   */
  var convertMillisecondsToSeconds = function(ms) {
    return Math.floor(ms / 1000);
  }

  /**
   * Checks if a variable is a Function.
   *
   * @param possibleFunction
   * @returns {boolean}
   */
  var isFunction = function(possibleFunction) {
    return (typeof(possibleFunction) == typeof(Function));
  }

  /**
   * Makes a GET call to the pinboard API endpoint to retrieve all
   * pinboard posts, removes private posts, and writes the results to redis.
   *
   * @param {Function} callback Called when processing is complete
   */
  var updateRedisPinboardPosts = function (callback) {
    pinboard.getAllPosts(function (error, response, body) {
      var pinboardPosts, filteredPosts;

      if (!error && response.statusCode == 200) {
        pinboardPosts = JSON.parse(body);

        filteredPosts = pinboardPosts.filter(function (el) {
          return (el.shared == 'yes');
        });

        redis.set(pinboardRedisKeys.lastUpdated, new Date().toString());
        redis.set(pinboardRedisKeys.posts, JSON.stringify(filteredPosts));

        console.info('updated pinboard data saved to redis');

        callback();
      } else {
        callback(error, response);
      }
    });
  };

  /**
   * Makes a call to pinboard for fresh bookmark data if fresh data
   * is available and the rate limit would not be exceeded.
   *
   * @param {Function} callback Called when processing is complete
   */
  var checkPinboardForFreshData = function (callback) {
    // set callback to a no-op if the param isn't a valid callback
    if (!isFunction(callback)) {
      callback = function() {};
    }

    // check when we last pulled pinboard posts
    redis.get(pinboardRedisKeys.lastUpdated, function (redisError, redisLastUpdated) {
      if (redisError) {
        console.error('redis client error: ' + redisError);
        callback(redisError);
      } else {
        if (!redisLastUpdated) {
          // we haven't asked pinboard for data before,
          // so we go ahead and do it without worrying about rate limits
          updateRedisPinboardPosts(callback);
        } else {
          // we've asked pinboard for data in the past, so we ask if there were changes.
          pinboard.getLastUpdateDate(function (error, response, body) {
            var pinboardLastUpdated, pinboardUpdateDate, redisUpdateDate, millisecondsSinceLastUpdated;

            if (!error && response.statusCode == 200) {
              pinboardLastUpdated = JSON.parse(body);
              pinboardUpdateDate = iso8601.toDate(pinboardLastUpdated.update_time);
              redisUpdateDate = new Date(redisLastUpdated);
              millisecondsSinceLastUpdated = new Date().getTime() - redisUpdateDate.getTime();

              if (pinboardUpdateDate > redisUpdateDate && millisecondsSinceLastUpdated >= pinboardRateLimits.postsAll) {
                // there were changes, and we do not need to throttle. Update pinboard bookmarks!
                updateRedisPinboardPosts(callback);
              } else {
                if (redisUpdateDate >= pinboardUpdateDate) {
                  console.info('no redis update needed for pinboard posts');
                } else {
                  console.info('pinboard update throttled. time remaining until next update: ' + convertMillisecondsToSeconds(pinboardRateLimits.postsAll - millisecondsSinceLastUpdated).toString() + ' seconds');
                }

                callback();
              }
            } else {
              if (error) {
                console.error('getLastUpdateDate error: ' + error);
              }
              if (response.statusCode !== 200) {
                console.error('getLastUpdateDate HTTP error.  response code: ' + response.statusCode.toString() + '; body: ' + body);
              }

              callback(error, response);
            }
          });
        }
      }
    });
  };

  return {
    checkPinboardForFreshData: checkPinboardForFreshData,
    redisKeys: pinboardRedisKeys,
    rateLimits: pinboardRateLimits
  }
})();

module.exports = pinboardUtils;