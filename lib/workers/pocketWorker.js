"use strict";
const BaseWorker = require("./baseWorker");
const { redisKeys } = require("../vars/pocketVars");
const { RequiredParamMissingError } = require("../errors");
const async = require("async");
const { orderBy } = require("lodash");

/**
 * Worker to poll Pocket for new archived articles
 */
class PocketWorker extends BaseWorker {
  /**
   * @param {object} opts
   * @param {object} opts.pocketClient The pocket client to use to perform requests
   * @param {object} opts.redisClient The redis client to use for data storage
   * @param {function} [opts.callback] The callback that will be called each time
   *  work has been completed. Signature is (err, details)
   */
  constructor(opts) {
    super(opts);

    if (!opts.pocketClient) {
      throw new RequiredParamMissingError("opts.pocketClient", "object");
    }

    if (!opts.redisClient) {
      throw new RequiredParamMissingError("opts.redisClient", "object");
    }

    this.client = opts.pocketClient;
    this.redis = opts.redisClient;
  }

  _doWork(callback) {
    const cancelled = {}; // fake error to indicate cancellation
    async.auto(
      {
        getAuthorization: (done) => {
          this.redis.hgetall(redisKeys.authorization, (err, authorization) => {
            if (err) {
              done(err);
              return;
            }

            if (!authorization) {
              // authorization has been revoked. Stop the worker.
              this.cancel();
              done(cancelled);
              return;
            }

            done(null, authorization);
          });
        },
        getPocketArticles: [
          "getAuthorization",
          (results, done) => {
            const accessToken = results.getAuthorization.access_token;

            /*
             * details about specific get params and the result format are available
             * in the api docs @ https://getpocket.com/developer/docs/v3/retrieve
             */
            const getParams = {
              access_token: accessToken,
              state: "archive", // only retrieve archive articles
              detailType: "complete", // get all details about the article
            };

            this.client.getArticles(getParams, done);
          },
        ],
        saveArticles: [
          "getPocketArticles",
          (results, done) => {
            // remove any articles tagged 'private'
            const publicArticles = results.getPocketArticles.filter(
              (article) =>
                !article.tags ||
                Object.keys(article.tags).every(
                  (key) => article.tags[key].tag !== "private"
                )
            );

            const sortedArticles = orderBy(
              publicArticles,
              ["time_read"],
              ["desc"]
            );

            // pocket articles are beefy.
            // keep only 10 to prevent redistogo oom errors.
            const top10Articles = sortedArticles.slice(0, 10);
            const jsonArticles = JSON.stringify(top10Articles);

            this.redis.set(redisKeys.articles, jsonArticles, done);
          },
        ],
      },
      (err) => {
        if (err === cancelled) {
          callback(null, "Worker cancelled; Authorization not available.");
          return;
        }

        callback(err);
      }
    );
  }
}

module.exports = PocketWorker;
