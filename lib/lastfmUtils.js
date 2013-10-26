module.exports = (function (){
  var _ = require('lodash'),
      redis = require('./redis'),
      sharedUtils = require('./sharedUtils'),
      LastfmUser = require('./lastfmApi').LastfmUser,
      lastfmApiKey = process.env['LASTFM_API_KEY'],
      lastfm = new LastfmUser(lastfmApiKey, 'chadxz'),
      lastfmRedisKeys, lastfmRateLimits;

  /**
   * Key names used to store the Last.fm data in Redis.
   *
   * @type {{lastUpdated: string, tracks: string}}
   */
  lastfmRedisKeys = {
    lastUpdated: 'lastfmLastUpdated',
    tracks: 'lastfmTracks'
  };

  /**
   * Time (in milliseconds) between connection attempts.
   *
   * @type {{defaultLimit: number}}
   */
  lastfmRateLimits = {
    defaultLimit: 1000
  };

  /**
   * Makes a GET call to the Last.fm API endpoint to retrieve all recently scrobbled tracks.
   *
   * Callback should have signature (error, response) if error handling is required.
   *
   * @param {Function} callback Called when processing is complete
   */
  function updateLastfmTracks(callback) {
    lastfm.getRecentTracks(function (error, response, body) {
      var lastfmResponse;

      if (error || response.statusCode !== 200) {
        callback(error, response);
        return;
      }

      lastfmResponse = JSON.parse(body);
      if ('error' in lastfmResponse) {
        console.error('Last.fm error: ' + lastfmResponse.message);
        callback(lastfmResponse.message);
      } else {
        redis.set(lastfmRedisKeys.lastUpdated, new Date().toString());
        redis.set(lastfmRedisKeys.tracks, body);

        console.info('Last.fm data saved to redis');
        callback();
      }
    });
  }

  /**
   * Makes a call to Last.fm for fresh track data if fresh data
   * is available and the rate limit would not be exceeded.
   *
   * Callback should have signature (error, response) if error handling is required.
   *
   * @param {Function} callback Called when processing is complete
   */
  function checkLastfmForFreshData(callback) {
    if (!_.isFunction(callback)) {
      callback = sharedUtils.noop;
    }

    redis.get(lastfmRedisKeys.lastUpdated, function (redisError, redisLastUpdated) {
      var lastUpdateDate, millisecondsSinceLastUpdated, throttleTimeRemaining;

      if (redisError) {
        console.error('redis client error: ' + redisError);
        callback(redisError);
        return;
      }

      if (!redisLastUpdated) {
        // we haven't asked Last.fm for data before,
        // so we go ahead and do it without worrying about rate limits
        updateLastfmTracks(callback);
      } else {
        lastUpdateDate = new Date(redisLastUpdated);
        millisecondsSinceLastUpdated = new Date().getTime() - lastUpdateDate.getTime();

        if (millisecondsSinceLastUpdated >= lastfmRateLimits.defaultLimit) {
          // we don't need to throttle, so go ahead and update
          updateLastfmTracks(callback);
        } else {
          throttleTimeRemaining = sharedUtils.convertMillisecondsToSeconds(lastfmRateLimits.defaultLimit - millisecondsSinceLastUpdated).toString();
          console.info('Last.fm updated throttled.  Time remaining until next update: ' + throttleTimeRemaining + ' seconds');
          callback();
        }
      }
    });
  }

  return {
    checkLastfmForFreshData: checkLastfmForFreshData,
    redisKeys: lastfmRedisKeys,
    rateLimits: lastfmRateLimits
  };
})();