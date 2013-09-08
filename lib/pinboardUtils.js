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

  var convertMinutesToMilliseconds = function (min) {
    var msPerMinute = 60000;
    return min * msPerMinute;
  }

  var updateRedisPinboardPosts = function (lastUpdated, callback) {
    pinboard.getAllPosts(function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var pinboardPosts = JSON.parse(body);
        redis.set(pinboardRedisKeys.lastUpdated, lastUpdated);
        redis.set(pinboardRedisKeys.posts, JSON.stringify(pinboardPosts));
        console.info('updated pinboard data saved to redis');
        callback();
      } else {
        callback(error, response);
      }
    });
  };

  var checkPinboardForFreshData = function (callback) {
    // check for existing pinboard posts
    redis.get(pinboardRedisKeys.lastUpdated, function (redisError, redisLastUpdated) {
      if (redisError) {
        console.error('redis client error: ' + redisError);
        callback(redisError);
      } else {
        pinboard.getLastUpdateDate(function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var lastUpdateDate = JSON.parse(body);
            var pinboardLastUpdated = iso8601.toDate(lastUpdateDate.update_time);
            var fiveMinutesInMS = convertMinutesToMilliseconds(5);
            var timeBetweenUpdates = pinboardLastUpdated - redisLastUpdated;

            // if existing pinboard posts do not exist, or if they are outdated, pull pinboard posts
            if (!redisLastUpdated || (pinboardLastUpdated > redisLastUpdated && timeBetweenUpdates > fiveMinutesInMS )) {
              updateRedisPinboardPosts(pinboardLastUpdated, callback);
            } else {
              console.info('no redis update needed for pinboard posts');
              callback();
            }
          } else {
            callback(error, response);
          }
        });
      }
    });
  };

  return {
    checkPinboardForFreshData: checkPinboardForFreshData,
    redisKeys: pinboardRedisKeys
  }
})();

module.exports = pinboardUtils;