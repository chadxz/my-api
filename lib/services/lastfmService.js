"use strict";
const { get } = require("lodash");
const { parseJSON } = require("../tools");
const { redisKeys } = require("../vars/lastfmVars");

class LastfmService {
  /**
   * Build a lastfm service.
   *
   * @param {object} opts
   * @param {object} opts.redisClient a redis client instance
   */
  constructor(opts) {
    this.redis = opts.redisClient;
  }

  /**
   * Retrieve lastfm tracks from the Redis store and parse the tracks out of them.
   *
   * @param {function} callback Callback with the signature (err, tracks)
   */
  getLastfmTracks(callback) {
    this.redis.get(redisKeys.tracks, (err, jsonTracks) => {
      if (err) {
        callback(err);
        return;
      }

      const rawTracks = parseJSON(jsonTracks);
      const tracks = get(rawTracks, "recenttracks.track");

      callback(null, tracks);
    });
  }
}

module.exports = LastfmService;
