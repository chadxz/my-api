"use strict";
const { redisKeys, rateLimitsMS } = require("../vars/pocketVars");
const { parseJSON } = require("../tools");

class PocketService {
  /**
   * Build a pocket service.
   *
   * @param {object} opts
   * @param {object} opts.redisClient a redis client instance
   * @param {PocketClient} opts.pocketClient the pocket consumer key
   * @param {PocketWorker} opts.pocketWorker the worker responsible for polling pocket
   */
  constructor(opts) {
    this.redis = opts.redisClient;
    this.client = opts.pocketClient;
    this.worker = opts.pocketWorker;
  }

  /**
   * Fetch a request token from the pocket api, which begins the oauth flow for
   * obtaining an access_token to make requests to the pocket api on behalf of a user.
   *
   * @param {string} redirectUri The uri that the pocket website should redirect to
   *  once the user has granted or denied access
   * @param {function} callback signature (err, requestToken)
   */
  getRequestToken(redirectUri, callback) {
    this.client.getRequestToken(redirectUri, callback);
  }

  /**
   * Fetch an access token from the pocket api. Requires a requestToken previously
   * fetched using `getRequestToken`. This function can be called once the user has
   * been redirected to pocket with the requestToken to approve/deny access, and pocket
   * has redirected the user back to this application.
   *
   * @param {string} requestToken The request token retrieved using `getRequestToken`
   * @param {function} callback signature (err, authorization)
   *  `authorization` is an object with structure { access_token, username }
   */
  getAccessToken(requestToken, callback) {
    this.client.getAccessToken(requestToken, callback);
  }

  /**
   * Retrieve the pocket authorization information from persistent storage.
   *
   * @param {function} callback signature (err, authorization)
   *  `authorization` is an object with structure { access_token, username }
   */
  getLocalAuthorization(callback) {
    this.redis.hgetall(redisKeys.authorization, (err, authorization) => {
      if (err) {
        callback(err);
        return;
      }

      if (!authorization) {
        callback();
        return;
      }

      callback(null, authorization);
    });
  }

  /**
   * Save the pocket oauth access_token and username to persistent storage.
   *
   * @param {object} authorization
   * @param {string} authorization.access_token The access_token used to make
   *  requests to the pocket api
   * @param {string} authorization.username The name of the user the
   *  access_token allows access to
   * @param {function} callback signature (err)
   */
  setLocalAuthorization(authorization, callback) {
    this.redis.hmset(redisKeys.authorization, authorization, (err) => {
      if (err) {
        callback(err);
        return;
      }

      callback();
    });
  }

  /**
   * Remove the currently stored authorization from persistent storage.
   *
   * @param {function} callback signature (err)
   */
  removeLocalAuthorization(callback) {
    this.redis.del(redisKeys.authorization, (err /* , affectedCount */) => {
      if (err) {
        callback(err);
        return;
      }

      callback();
    });
  }

  /**
   * Remove the currently stored articles from persistent storage, along
   * with the lastUpdated key indicating their update date.
   *
   * @param {function} callback signature (err)
   */
  removeLocalArticles(callback) {
    this.redis.del(redisKeys.articles, (err /*, affectedCount */) => {
      if (err) {
        callback(err);
        return;
      }

      callback();
    });
  }

  /**
   * Retrieve the current list of cached articles from persistent storage.
   *
   * @param {function} callback signature (err, articles)
   */
  getLocalArticles(callback) {
    this.redis.get(redisKeys.articles, (err, articlesJSON) => {
      if (err) {
        callback(err);
        return;
      }

      callback(null, parseJSON(articlesJSON));
    });
  }

  startWorker() {
    this.worker.start(rateLimitsMS.userLimit * 4);
  }

  stopWorker() {
    this.worker.cancel();
  }
}

module.exports = PocketService;
