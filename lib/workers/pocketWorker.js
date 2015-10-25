'use strict';

var util = require('util');
var tools = require('../tools');
var Worker = require('./baseWorker');
var vars = require('../vars/pocketVars');
var errors = require('../errors');
var async = require('async');
var redisKeys = vars.redisKeys;

/**
 * Worker to poll pocket for new archived articles
 *
 * @param {object} opts
 * @param {object} opts.pocketClient The pocket client to use to perform requests
 * @param {object} opts.redisClient The redis client to use for data storage
 * @class PocketWorker
 */
function PocketWorker(opts) {
  opts = opts || {};

  if (!opts.pocketClient) {
    throw new errors.RequiredParamMissingError('opts.pocketClient', 'object');
  }

  if (!opts.redisClient) {
    throw new errors.RequiredParamMissingError('opts.redisClient', 'object');
  }

  Worker.call(this, opts);

  this.client = opts.pocketClient;
  this.redis = opts.redisClient;
}

util.inherits(PocketWorker, Worker);

// set name of class, for use with loggers
PocketWorker.prototype.name = 'PocketWorker';

/**
 * When triggered by the Worker timer, retrieve the latest pocket archived
 * articles from the api, and save them to redis.
 *
 * @param {function} callback called when the work has been completed.
 *  signature (err, workDetails)
 * @memberof PocketWorker
 * @private
 */
PocketWorker.prototype._doWork = function (callback) {
  var self = this;

  var cancelled = {}; // fake error to indicate cancellation
  var noUpdateNeeded = {}; // fake error to indicate there were no new articles
  async.auto({
    getAuthorization: function (done) {
      self.redis.hgetall(redisKeys.authorization, function (err, authorization) {
        if (err) {
          done(err);
          return;
        }

        if (!authorization) {
          // authorization has been revoked. Stop the worker.
          self.cancel();
          done(cancelled);
          return;
        }

        done(null, authorization);
      });
    },
    getLastLocalUpdateTimestamp: ['getAuthorization', function (done) {
      self.redis.get(redisKeys.lastUpdated, done);
    }],
    getExistingArticles: ['getAuthorization', function (done) {
      self.redis.get(redisKeys.articles, function (err, articlesJSON) {
        if (err) {
          done(err);
          return;
        }

        if (!articlesJSON) {
          done(null, []);
          return;
        }

        // articles are stored as JSON, so de-serialize them
        done(null, tools.parseJSON(articlesJSON));
      });
    }],
    getPocketArticles: ['getLastLocalUpdateTimestamp', function (done, results) {
      var accessToken = results.getAuthorization && results.getAuthorization.access_token;
      var lastLocalUpdateTimestamp = results.getLastLocalUpdateTimestamp;

      /*
       * details about specific get params and the result format are available
       * in the api docs @ https://getpocket.com/developer/docs/v3/retrieve
       */

      var getParams = {
        access_token: accessToken,
        state: 'archive', // only retrieve archive articles
        sort: 'newest', // sort newest -> oldest
        detailType: 'complete' // get all details about the article
      };

      // limit request to only those articles added since we last checked
      if (lastLocalUpdateTimestamp) {
        getParams.since = lastLocalUpdateTimestamp;
      }

      self.client.getArticles(getParams, done);
    }],
    saveNewArticles: ['getExistingArticles', 'getPocketArticles', function (done, results) {
      var newArticles = results.getPocketArticles;

      if (!newArticles || !newArticles.length) {
        // nothing to save
        done(noUpdateNeeded);
        return;
      }

      var existingArticles = results.getExistingArticles;
      var mergedArticles = newArticles.concat(existingArticles);

      self.redis.set(redisKeys.articles, JSON.stringify(mergedArticles), done);
    }],
    setLastLocalUpdate: ['saveNewArticles', function (done) {
      var currentUNIXTimestamp = new Date().getTime() / 1000;
      self.redis.set(redisKeys.lastUpdated, currentUNIXTimestamp, done);
    }]
  }, function (err /*, results */) {
    if (err === cancelled) {
      callback(null, 'worker cancelled; authorization not available');
      return;
    }

    if (err === noUpdateNeeded) {
      callback(null, 'no redis updated needed for pocket articles');
      return;
    }

    callback(err);
  });
};

module.exports = PocketWorker;
