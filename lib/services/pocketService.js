'use strict';
var pocketVars = require('../vars/pocketVars');

/**
 * Build a pocket service.
 *
 * @param {object} opts
 * @param {*} opts.redisClient a redis client instance
 * @param {string} opts.pocketClient the pocket consumer key
 * @param {*} opts.pocketWorker the worker responsible for polling pocket
 * @class PocketService
 */
function PocketService(opts) {
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
 * @memberof PocketService
 */
PocketService.prototype.getRequestToken = function (redirectUri, callback) {
  this.client.getRequestToken(redirectUri, callback);
};

/**
 * Fetch an access token from the pocket api. Requires a requestToken previously
 * fetched using `getRequestToken`. This function can be called once the user has
 * been redirected to pocket with the requestToken to approve/deny access, and pocket
 * has redirected the user back to this application.
 *
 * @param {string} requestToken The request token retrieved using `getRequestToken`
 * @param {function} callback signature (err, authorization)
 *  `authorization` is an object with structure { access_token, username }
 * @memberof PocketService
 */
PocketService.prototype.getAccessToken = function (requestToken, callback) {
  this.client.getAccessToken(requestToken, callback);
};

/**
 * Retrieve the pocket authorization information from persistent storage.
 *
 * @param {function} callback signature (err, authorization)
 *  `authorization` is an object with structure { access_token, username }
 * @memberof PocketService
 */
PocketService.prototype.getLocalAuthorization = function (callback) {
  this.redis.hgetall(pocketVars.redisKeys.authorization, function (err, authorization) {
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
};

/**
 * Save the pocket oauth access_token and username to persistent storage.
 *
 * @param {object} authorization
 * @param {string} authorization.access_token The access_token used to make requests to
 *  the pocket api
 * @param {string} authorization.username The name of the user the access_token allows
 *  access to
 * @param {function} callback signature (err)
 * @memberof PocketService
 */
PocketService.prototype.setLocalAuthorization = function (authorization, callback) {
  this.redis.hmset(pocketVars.redisKeys.authorization, authorization, function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
};

/**
 * Remove the currently stored authorization from persistent storage.
 *
 * @param {function} callback signature (err)
 * @memberof PocketService
 */
PocketService.prototype.removeLocalAuthorization = function (callback) {
  this.redis.del(pocketVars.redisKeys.authorization, function (err /*, affectedCount */) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
};

/**
 * Remove the currently stored articles from persistent storage, along
 * with the lastUpdated key indicating their update date.
 *
 * @param {function} callback signature (err)
 */
PocketService.prototype.removeLocalArticles = function (callback) {
  this.redis.del(pocketVars.redisKeys.articles,
    pocketVars.redisKeys.lastUpdated, function (err /*, affectedCount */) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
};

/**
 * Retrieve the current list of cached articles from persistent storage.
 *
 * @param {function} callback signature (err, articles)
 */
PocketService.prototype.getLocalArticles = function (callback) {
  this.redis.get(pocketVars.redisKeys.articles, callback);
};

PocketService.prototype.startWorker = function () {
  this.worker.start(pocketVars.rateLimitMS.userLimit * 4);
};

PocketService.prototype.stopWorker = function () {
  this.worker.cancel();
};

module.exports = PocketService;
