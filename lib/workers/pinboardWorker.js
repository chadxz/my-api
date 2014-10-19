'use strict';

var util = require('util');
var tools = require('../tools');
var Worker = require('./baseWorker');
var vars = require('../vars/pinboardVars');
var errors = require('../errors');
var redisKeys = vars.redisKeys;
var rateLimitsMS = vars.rateLimitsMS;

/**
 * Worker to poll pinboard for recent pins.
 *
 * @param {object} opts
 * @param {object} opts.pinboardClient The pinboard client to use to perform requests
 * @param {object} opts.redisClient The redis client to use for data storage
 * @class PinboardWorker
 */
function PinboardWorker(opts) {
  opts = opts || {};

  if (!(this instanceof PinboardWorker)) {
    return new PinboardWorker(opts);
  }

  if (!opts.pinboardClient) {
    throw new errors.RequiredParamMissingError('opts.pinboardClient', 'object');
  }

  if (!opts.redisClient) {
    throw new errors.RequiredParamMissingError('opts.redisClient', 'object');
  }

  Worker.call(this, opts);

  this.client = opts.pinboardClient;
  this.redis = opts.redisClient;
}

util.inherits(PinboardWorker, Worker);

/**
 * Work done when interval fires after 'start' is called
 *
 * @param {function} callback The callback to call when the work has been completed. Signature (err, workDetails)
 * @memberof PinboardWorker
 * @private
 */
PinboardWorker.prototype._doWork = function (callback) {
  var self = this;

  self.redis.get(redisKeys.lastUpdated, function (err, lastLocalUpdate) {
    if (err) {
      callback(err);
      return;
    }

    if (!lastLocalUpdate) {
      // we haven't asked pinboard for data before,
      // so we go ahead and do it without worrying about rate limits.
      self._updatePinboardData(callback);
      return;
    }

    // convert lastLocalUpdate to an actual Javascript Date
    lastLocalUpdate = new Date(lastLocalUpdate);

    // we've asked pinboard for data in the past, so we ask if there were changes.
    self.client.getLastUpdateDate(function (err, pinboardLastUpdateDate) {
      if (err) {
        callback(err);
        return;
      }

      if (lastLocalUpdate >= pinboardLastUpdateDate) {
        // bookmarks haven't changed since they were last updated
        callback(null, 'no redis update needed for pinboard posts');
        return;
      }

      var msSinceLastUpdated = (new Date()).getTime() - pinboardLastUpdateDate.getTime();
      if (pinboardLastUpdateDate > lastLocalUpdate && msSinceLastUpdated >= rateLimitsMS.postsAll) {
        // there were changes, and we do not need to throttle. Update pinboard bookmarks!
        self._updatePinboardData(callback);
        return;
      }

      // there are new bookmarks available, but due to rate limit constraints, we shouldn't try to pull them yet
      var throttleTimeRemaining = tools.toSeconds(rateLimitsMS.postsAll - msSinceLastUpdated);
      callback(null, 'pinboard update throttled. time remaining until next update: ' + throttleTimeRemaining + ' seconds');
    });
  });
};

/**
 * pull the pinboard data from the api and save it to redis
 *
 * @param {function} callback The callback to call when finished updating. Signature is (err, workDetails)
 * @memberof LastfmWorker
 * @private
 */
PinboardWorker.prototype._updatePinboardData = function (callback) {
  var self = this;

  self.client.getAllPosts(function (err, allPosts) {
    if (err) {
      callback(err);
      return;
    }

    // remove private posts
    var filteredPosts = allPosts.filter(function (post) {
      return (post.shared === 'yes');
    });

    self.redis.set(redisKeys.lastUpdated, new Date().toISOString());
    self.redis.set(redisKeys.posts, JSON.stringify(filteredPosts));
    callback();
  });

};

module.exports = PinboardWorker;
