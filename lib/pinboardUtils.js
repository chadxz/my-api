module.exports = (function () {
  var _ = require('lodash'),
      iso8601 = require('iso8601'),
      redis = require('./redis'),
      sharedUtils = require('./sharedUtils'),
      Pinboard = require('./pinboardApi').Pinboard,
      pinboardApiToken = process.env['PINBOARD_API_TOKEN'],
      pinboard = new Pinboard(pinboardApiToken),
      pinboardRedisKeys, pinboardRateLimits;

  /**
   * Key names used to store the Pinboard data in Redis.
   *
   * @type {{lastUpdated: string, posts: string}}
   */
  pinboardRedisKeys = {
    lastUpdated: 'pinboardLastUpdated',
    posts: 'pinboardPosts'
  };

  /**
   * Time (in milliseconds) between connection attempts for the different method calls.
   *
   * @type {{postsAll: number, postsRecent: number, defaultLimit: number}}
   */
  pinboardRateLimits = {
    postsAll: 300000,
    postsRecent: 60000,
    defaultLimit: 3000
  };

  /**
   * Makes a GET call to the pinboard API endpoint to retrieve all
   * pinboard posts, removes private posts, and writes the results to redis.
   *
   * Callback should have signature (error, response) if error handling is required.
   *
   * @param {Function} callback Called when processing is complete
   */
   function updateRedisPinboardPosts(callback) {
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
  }

  /**
   * Makes a call to pinboard for fresh bookmark data if fresh data
   * is available and the rate limit would not be exceeded.
   *
   * Callback should have signature (error, response) if error handling is required.
   *
   * @param {Function} callback Called when processing is complete
   */
  function checkPinboardForFreshData(callback) {
    // set callback to a no-op if the param isn't a valid callback
    if (!_.isFunction(callback)) {
      callback = sharedUtils.noop;
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
            var pinboardLastUpdated, pinboardUpdateDate, lastUpdateDate, millisecondsSinceLastUpdated, throttleTimeRemaining;

            if (!error && response.statusCode == 200) {
              pinboardLastUpdated = JSON.parse(body);
              pinboardUpdateDate = iso8601.toDate(pinboardLastUpdated.update_time);
              lastUpdateDate = new Date(redisLastUpdated);
              millisecondsSinceLastUpdated = new Date().getTime() - lastUpdateDate.getTime();

              if (pinboardUpdateDate > lastUpdateDate && millisecondsSinceLastUpdated >= pinboardRateLimits.postsAll) {
                // there were changes, and we do not need to throttle. Update pinboard bookmarks!
                updateRedisPinboardPosts(callback);
              } else {
                if (lastUpdateDate >= pinboardUpdateDate) {
                  console.info('no redis update needed for pinboard posts');
                } else {
                  throttleTimeRemaining = sharedUtils.convertMillisecondsToSeconds(pinboardRateLimits.postsAll - millisecondsSinceLastUpdated).toString();
                  console.info('pinboard update throttled. time remaining until next update: ' + throttleTimeRemaining + ' seconds');
                }

                callback();
              }
            } else {
              if (error) {
                console.error('getLastUpdateDate error: ' + error);
              }
              if (response.statusCode !== 200) {
                console.error('getLastUpdateDate HTTP error.  response code: ' + response.statusCode.toString());
              }

              callback(error, response);
            }
          });
        }
      }
    });
  }

  return {
    checkPinboardForFreshData: checkPinboardForFreshData,
    redisKeys: pinboardRedisKeys,
    rateLimits: pinboardRateLimits
  };
})();