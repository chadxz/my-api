"use strict";
const { oneLine } = require("common-tags");
const { toSeconds } = require("../tools");
const BaseWorker = require("./baseWorker");
const { redisKeys, rateLimitsMS } = require("../vars/pinboardVars");
const { RequiredParamMissingError } = require("../errors");

/**
 * Worker to poll pinboard for recent pins.
 */
class PinboardWorker extends BaseWorker {
  /**
   * @param {object} opts
   * @param {object} opts.pinboardClient The pinboard client to use to perform requests
   * @param {object} opts.redisClient The redis client to use for data storage
   * @param {function} [opts.callback] The callback that will be called each time
   *  work has been completed. Signature is (err, details)
   */
  constructor(opts = {}) {
    super(opts);

    if (!opts.pinboardClient) {
      throw new RequiredParamMissingError("opts.pinboardClient", "object");
    }

    if (!opts.redisClient) {
      throw new RequiredParamMissingError("opts.redisClient", "object");
    }

    this.client = opts.pinboardClient;
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
        // we haven't asked pinboard for data before,
        // so we go ahead and do it without worrying about rate limits.
        this._updatePinboardData(callback);
        return;
      }

      // convert lastLocalUpdate to an actual Javascript Date
      lastLocalUpdate = new Date(lastLocalUpdate);

      // we've asked pinboard for data in the past, so we ask if there were changes.
      this.client.getLastUpdateDate((err, pinboardLastUpdateDate) => {
        if (err) {
          callback(err);
          return;
        }

        if (lastLocalUpdate >= pinboardLastUpdateDate) {
          // bookmarks haven't changed since they were last updated
          callback(null, "no redis update needed for pinboard posts");
          return;
        }

        const updateAvailable = pinboardLastUpdateDate > lastLocalUpdate;
        const msSinceLastUpdated = Date.now() - lastLocalUpdate.getTime();
        const withinRateLimit = msSinceLastUpdated >= rateLimitsMS.postsAll;

        if (updateAvailable && withinRateLimit) {
          // there were changes, and we do not need to throttle.
          // Update pinboard bookmarks!
          this._updatePinboardData(callback);
          return;
        }

        // there are new bookmarks available,
        // but due to rate limit constraints, we shouldn't try to pull them yet
        const msRemaining = rateLimitsMS.postsAll - msSinceLastUpdated;
        const throttleTimeRemaining = toSeconds(msRemaining);
        const throttledMessage = oneLine`
          Pinboard update throttled.
          Time remaining until next update: ${throttleTimeRemaining} seconds.
        `;

        callback(null, throttledMessage);
      });
    });
  }

  /**
   * pull the pinboard data from the api and save it to redis
   *
   * @param {function} callback The callback to call when finished updating.
   *  Signature is (err, workDetails)
   * @private
   */
  _updatePinboardData(callback) {
    this.client.getAllPosts((err, allPosts) => {
      if (err) {
        callback(err);
        return;
      }

      // remove private posts
      const filteredPosts = allPosts.filter(post => post.shared === "yes");

      this.redis.set(redisKeys.lastUpdated, new Date().toISOString());
      this.redis.set(redisKeys.posts, JSON.stringify(filteredPosts));
      callback();
    });
  }
}

module.exports = PinboardWorker;
