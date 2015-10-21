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
