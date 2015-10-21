'use strict';
var pocketVars = require('../vars/pocketVars');

/**
 * Build a pocket service.
 *
 * @param {object} opts
 * @param {*} opts.redisClient a redis client instance
 * @param {string} opts.pocketClient the pocket consumer key
 * @class PocketService
 */
function PocketService(opts) {
  this.redis = opts.redisClient;
  this.client = opts.pocketClient;
}

/**
 * Retrieve the pocket authorization information from redis.
 *
 * authorization is an object with structure { username, accessToken }
 *
 * @param {function} callback signature (err, authorization)
 * @memberof PocketService
 */
PocketService.prototype.getAuthorization = function (callback) {
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

PocketService.prototype.setAuthorization = function (authorization, callback) {
  this.redis.hmset(pocketVars.redisKeys.authorization, authorization, function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
};

PocketService.prototype.removeAuthorization = function (callback) {
  this.redis.del(pocketVars.redisKeys.authorization, function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback();
  });
};

PocketService.prototype.getRequestToken = function (redirectUri, callback) {
  this.client.getRequestToken(redirectUri, callback);
};

PocketService.prototype.getAccessToken = function (requestToken, callback) {
  this.client.getAccessToken(requestToken, callback);
};

module.exports = PocketService;
