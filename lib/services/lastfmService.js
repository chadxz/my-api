"use strict";

var lastfmVars = require("../vars/lastfmVars");

/**
 * Build a lastfm service.
 *
 * @param {object} opts
 * @param {object} opts.redis a redis client instance
 * @class LastfmService
 */
function LastfmService(opts) {
  this.redis = opts.redisClient;
}

/**
 * Retrieve lastfm tracks from the Redis store and parse the tracks out of them.
 *
 * @param {function} callback Callback with the signature (err, tracks)
 * @memberof LastfmService
 */
LastfmService.prototype.getLastfmTracks = function(callback) {
  this.redis.get(lastfmVars.redisKeys.tracks, function(err, jsonTracks) {
    if (err) {
      callback(new Error("Error reading lastfm tracks from redis"));
      return;
    }

    var tracks;

    try {
      tracks = JSON.parse(jsonTracks).recenttracks.track;
    } catch (e) {
      callback(new Error("Error parsing lastfm tracks stored in redis"));
      return;
    }

    callback(null, tracks);
  });
};

module.exports = LastfmService;
