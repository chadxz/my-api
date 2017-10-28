"use strict";
const { oneLine } = require("common-tags");
const { toSeconds } = require("../tools");
const BaseWorker = require("./baseWorker");
const { RequiredParamMissingError } = require("../errors");
const { redisKeys, rateLimitsMS } = require("../vars/lastfmVars");

/**
 * Worker to poll Lastfm for recent tracks data.
 */
class LastfmWorker extends BaseWorker {
  /*
   * @param {object} opts
   * @param {object} opts.lastfmClient the lastfm client to use to perform the requests
   * @param {object} opts.redisClient The redis client to use to perform the data lookups
   * @param {function} [opts.callback] The callback that will be called each time
   *  work has been completed. Signature is (err, details)
   */
  constructor(opts = {}) {
    super(opts);

    if (!opts.lastfmClient) {
      throw new RequiredParamMissingError("opts.lastfmClient", "object");
    }

    if (!opts.redisClient) {
      throw new RequiredParamMissingError("opts.redisClient", "object");
    }

    this.client = opts.lastfmClient;
    this.redis = opts.redisClient;
  }

  /**
   * Work done when interval fires after 'start' is called
   *
   * @param {function} callback The callback to call when the work has been
   *  completed. Signature (err, workDetails)
   * @private
   */
  _doWork(callback) {
    this.redis.get(redisKeys.lastUpdated, (err, lastLocalUpdate) => {
      if (err) {
        callback(err);
        return;
      }

      if (!lastLocalUpdate) {
        // we haven't asked Last.fm for data before,
        // so go ahead and do it without worrying about rate limits
        this._updateLastfmData(callback);
        return;
      }

      lastLocalUpdate = new Date(lastLocalUpdate);
      const msSinceLastUpdated = Date.now() - lastLocalUpdate.getTime();

      if (msSinceLastUpdated >= rateLimitsMS.defaultLimit) {
        this._updateLastfmData(callback);
        return;
      }

      const msRemaining = rateLimitsMS.defaultLimit - msSinceLastUpdated;
      const throttleTimeRemaining = toSeconds(msRemaining);
      const throttledMessage = oneLine`
        Last.fm update throttled. 
        Time remaining until next update: ${throttleTimeRemaining} seconds
      `;

      callback(null, throttledMessage);
    });
  }

  /**
   * pull the lastfm data from the api and save it to redis
   *
   * @param {function} callback The callback to call when finished updating.
   *  Signature is (err, workDetails)
   * @private
   */
  _updateLastfmData(callback) {
    this.client.getRecentTracks((err, tracks) => {
      if (err) {
        callback(err);
        return;
      }

      this.redis.set(redisKeys.lastUpdated, new Date().toISOString());
      this.redis.set(redisKeys.tracks, JSON.stringify(tracks));
      callback();
    });
  }
}

module.exports = LastfmWorker;
