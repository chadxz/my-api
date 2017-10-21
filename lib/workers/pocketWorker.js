"use strict";

var util = require("util");
var Worker = require("./baseWorker");
var vars = require("../vars/pocketVars");
var errors = require("../errors");
var async = require("async");
var { sortByOrder } = require("lodash");
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
    throw new errors.RequiredParamMissingError("opts.pocketClient", "object");
  }

  if (!opts.redisClient) {
    throw new errors.RequiredParamMissingError("opts.redisClient", "object");
  }

  Worker.call(this, opts);

  this.client = opts.pocketClient;
  this.redis = opts.redisClient;
}

util.inherits(PocketWorker, Worker);

// set name of class, for use with loggers
PocketWorker.prototype.name = "PocketWorker";

/**
 * When triggered by the Worker timer, retrieve the latest pocket archived
 * articles from the api, and save them to redis.
 *
 * @param {function} callback called when the work has been completed.
 *  signature (err, workDetails)
 * @memberof PocketWorker
 * @private
 */
PocketWorker.prototype._doWork = function(callback) {
  var self = this;

  var cancelled = {}; // fake error to indicate cancellation
  async.auto(
    {
      getAuthorization: function(done) {
        self.redis.hgetall(redisKeys.authorization, function(
          err,
          authorization
        ) {
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
      getPocketArticles: [
        "getAuthorization",
        function(results, done) {
          var accessToken = results.getAuthorization.access_token;

          /*
       * details about specific get params and the result format are available
       * in the api docs @ https://getpocket.com/developer/docs/v3/retrieve
       */
          var getParams = {
            access_token: accessToken,
            state: "archive", // only retrieve archive articles
            detailType: "complete" // get all details about the article
          };

          self.client.getArticles(getParams, done);
        }
      ],
      saveArticles: [
        "getPocketArticles",
        function(results, done) {
          // remove any articles tagged 'private'
          var articles = results.getPocketArticles.filter(function(article) {
            return (
              !article.tags ||
              Object.keys(article.tags).every(function(key) {
                return article.tags[key].tag !== "private";
              })
            );
          });

          articles = sortByOrder(articles, ["time_read"], ["desc"]);

          // pocket articles are beefy.
          // keep only 10 to prevent redistogo oom errors.
          articles = articles.slice(0, 10);

          self.redis.set(redisKeys.articles, JSON.stringify(articles), done);
        }
      ]
    },
    function(err /*, results */) {
      if (err === cancelled) {
        callback(null, "worker cancelled; authorization not available");
        return;
      }

      callback(err);
    }
  );
};

module.exports = PocketWorker;
