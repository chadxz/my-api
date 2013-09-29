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

  var convertMillisecondsToSeconds = function(ms) {
    return Math.floor(ms / 1000);
  }

  var isFunction = function(possibleFunction) {
    return (typeof(possibleFunction) == typeof(Function));
  }

  var updateRedisPinboardPosts = function (lastUpdated, callback) {
    pinboard.getAllPosts(function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var pinboardPosts = JSON.parse(body);
        redis.set(pinboardRedisKeys.lastUpdated, lastUpdated.toString());
        redis.set(pinboardRedisKeys.posts, JSON.stringify(pinboardPosts));
        console.info('updated pinboard data saved to redis');
        callback();
      } else {
        callback(error, response);
      }
    });
  };

  var checkPinboardForFreshData = function (callback) {

    // set callback to a no-op if the param isn't a valid callback
    if (!isFunction(callback)) {
      callback = function() {};
    }

    // check for existing pinboard posts
    redis.get(pinboardRedisKeys.lastUpdated, function (redisError, redisLastUpdated) {
      if (redisError) {
        console.error('redis client error: ' + redisError);
        callback(redisError);
      } else {
        pinboard.getLastUpdateDate(function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var pinboardLastUpdated = JSON.parse(body);
            var pinboardUpdateDate = iso8601.toDate(pinboardLastUpdated.update_time);
            var redisUpdateDate = new Date(redisLastUpdated);
            var millisecondsSinceLastUpdated = new Date().getTime() - redisUpdateDate.getTime();

            if (!redisLastUpdated || (pinboardUpdateDate > redisUpdateDate && millisecondsSinceLastUpdated >= pinboardRateLimits.postsAll)) {
              updateRedisPinboardPosts(pinboardUpdateDate, callback);
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
              console.error('getLastUpdateDate response code: ' + response.statusCode.toString());
            }

            callback(error, response);
          }
        });
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