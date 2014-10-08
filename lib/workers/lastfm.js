'use strict';

var util = require('util');
var tools = require('../tools');
var Worker = require('./base');
var errors = require('../errors');
var vars = require('../vars/lastfm');
var redisKeys = vars.redisKeys;
var rateLimitsMS = vars.rateLimitsMS;

/**
 * Worker to poll Lastfm for recent tracks data.
 *
 * @param {object} opts
 * @param {object} opts.lastfmClient the lastfm client to use to perform the requests
 * @param {string} opts.redisClient The redis client to use to perform the data lookups
 * @class LastfmWorker
 */
function LastfmWorker(opts) {
  opts = opts || {};

  if (!(this instanceof LastfmWorker)) {
    return new LastfmWorker(opts);
  }

  if (!opts.lastfmClient) {
    throw new errors.RequiredParamMissingError('opts.lastfmClient', 'object');
  }

  if (!opts.redisClient) {
    throw new errors.RequiredParamMissingError('opts.redisClient', 'object');
  }

  Worker.call(this, opts);

  this.client = opts.lastfmClient;
  this.redis = opts.redisClient;
}

util.inherits(LastfmWorker, Worker);

/**
 * Work done when interval fires after 'start' is called
 *
 * @param {function} callback The callback to call when the work has been completed
 * @memberof LastfmWorker
 * @private
 */
LastfmWorker.prototype._doWork = function (callback) {
  var self = this;

  self.redis.get(redisKeys.lastUpdated, function (err, lastUpdated) {
    if (err) {
      callback(err);
      return;
    }

    if (!lastUpdated) {
      // we haven't asked Last.fm for data before,
      // so we go ahead and do it without worrying about rate limits
      self._updateLastfm(callback);
      return;
    }

    var lastUpdateDate = new Date(lastUpdated);
    var msSinceLastUpdated = new Date().getTime() - lastUpdateDate.getTime();

    if (msSinceLastUpdated >= rateLimitsMS.globalLimit) {
      self._updateLastfm(callback);
      return;
    }

    var throttleTimeRemaining = tools.toSeconds(rateLimitsMS.globalLimit - msSinceLastUpdated);
    callback(null, 'Last.fm update throttled. Time remaining until next update: ' + throttleTimeRemaining + ' seconds.');
  });
};

/**
 * pull the lastfm data from the api and save it to redis
 *
 * @param {function} callback The callback to call when finished updating. Signature is (err, details)
 * @memberof LastfmWorker
 * @private
 */
LastfmWorker.prototype._updateLastfm = function (callback) {
  var self = this;

  self.client.getRecentTracks(function (err, tracks) {
    if (err) {
      callback(err);
      return;
    }

    self.redis.set(redisKeys.lastUpdated, new Date().toISOString());
    self.redis.set(redisKeys.tracks, JSON.stringify(tracks));
    callback();
  });
};

module.exports = LastfmWorker;