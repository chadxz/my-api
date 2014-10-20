'use strict';

var util = require('util');
var tools = require('../tools');
var Worker = require('./baseWorker');
var errors = require('../errors');
var vars = require('../vars/lastfmVars');
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

// set name of class, for use with loggers
LastfmWorker.prototype.name = 'LastfmWorker';

/**
 * Work done when interval fires after 'start' is called
 *
 * @param {function} callback The callback to call when the work has been completed. Signature (err, workDetails)
 * @memberof LastfmWorker
 * @private
 */
LastfmWorker.prototype._doWork = function (callback) {
  var self = this;
  self.redis.get(redisKeys.lastUpdated, function (err, lastLocalUpdate) {
    if (err) {
      callback(err);
      return;
    }

    if (!lastLocalUpdate) {
      // we haven't asked Last.fm for data before,
      // so we go ahead and do it without worrying about rate limits
      self._updateLastfmData(callback);
      return;
    }

    lastLocalUpdate = new Date(lastLocalUpdate);
    var msSinceLastUpdated = new Date().getTime() - lastLocalUpdate.getTime();

    if (msSinceLastUpdated >= rateLimitsMS.defaultLimit) {
      self._updateLastfmData(callback);
      return;
    }

    var throttleTimeRemaining = tools.toSeconds(rateLimitsMS.defaultLimit - msSinceLastUpdated);
    callback(null, 'Last.fm update throttled. Time remaining until next update: ' + throttleTimeRemaining + ' seconds.');
  });
};

/**
 * pull the lastfm data from the api and save it to redis
 *
 * @param {function} callback The callback to call when finished updating. Signature is (err, workDetails)
 * @memberof LastfmWorker
 * @private
 */
LastfmWorker.prototype._updateLastfmData = function (callback) {
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
