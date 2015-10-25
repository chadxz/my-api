'use strict';

var url = require('url');
var tools = require('../tools');
var errors = require('../errors');
var request = require('request').defaults({
  json: true,
  timeout: 5000,
  headers: {
    // pocket servers choke unless these are set ¯\_(ツ)_/¯
    'X-Accept': 'application/json',
    accept: '*'
  }
});
var apiBase = 'https://getpocket.com/v3/';

/**
 * Constructs an instance of the PocketClient class, used to make API calls to the Pocket web API.
 *
 * @param {string} consumerKey Pocket consumer key
 * @class PocketClient
 */
function PocketClient(consumerKey) {
  if (!consumerKey) {
    throw new errors.RequiredParamMissingError('consumerKey', 'string');
  }

  this.consumerKey = consumerKey;
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
PocketClient.prototype.getRequestToken = function (redirectUri, callback) {
  var options = {
    uri: url.resolve(apiBase, 'oauth/request'),
    json: {
      consumer_key: this.consumerKey,
      redirect_uri: redirectUri
    }
  };

  request.post(options, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!tools.isOk(res.statusCode) || typeof body !== 'object') {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    callback(null, body.code);
  });
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
PocketClient.prototype.getAccessToken = function (requestToken, callback) {
  var options = {
    uri: url.resolve(apiBase, 'oauth/authorize'),
    json: {
      consumer_key: this.consumerKey,
      code: requestToken
    }
  };

  request.post(options, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!tools.isOk(res.statusCode) || typeof body !== 'object') {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    callback(null, body);
  });
};

module.exports = PocketClient;
