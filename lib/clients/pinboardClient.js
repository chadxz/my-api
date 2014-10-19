'use strict';

var url = require('url');
var tools = require('../tools');
var errors = require('../errors');
var request = require('request').defaults({ json: true });
var apiBase = 'https://api.pinboard.in/v1/';

/**
 * Constructs an instance of the PinboardClient class, used to make API calls to the Pinboard web API.
 *
 * @param {string} apiToken Pinboard API token
 * @class PinboardClient
 */
function PinboardClient(apiToken) {
  if (!(this instanceof PinboardClient)) {
    return new PinboardClient(apiToken);
  }

  if (!apiToken) {
    throw new errors.RequiredParamMissingError('apiToken', 'string');
  }

  this.apiToken = apiToken;
}

/**
 * Concatenates the format, auth_token, and specified
 * method together to produce a fully formed Pinboard API url.
 *
 * @param {string} method The method you want to call on the api, i.e. 'posts/update' or 'posts/all'
 * @returns {string} The fully formed Pinboard API url, or an empty string if {@link method} is not a string
 * @memberof PinboardClient
 */
PinboardClient.prototype.getApiCallUrl = function (method) {

  if (!method) {
    throw new errors.RequiredParamMissingError('method', 'string');
  }

  var parts = url.parse(apiBase);
  parts.query = {
    auth_token: this.apiToken,
    format: 'json'
  };

  return url.format(parts);
};

/**
 * Make an http request to GET all pinboard bookmarks.
 * Callback should have signature (error, response, body).
 *
 * @param {Function} callback with signature (error, allPosts)
 * @memberof PinboardClient
 */
PinboardClient.prototype.getAllPosts = function (callback) {
  var url = this.getApiCallUrl('posts/all');
  request(url, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!tools.isOk(res.statusCode) || (typeof(body) !== 'object')) {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    callback(null, body);
  });
};

/**
 * Make an http request to GET the date the pinboard was last updated.
 *
 * @param {Function} callback with signature (err, lastUpdateDate)
 * @memberof PinboardClient
 */
PinboardClient.prototype.getLastUpdateDate = function (callback) {
  var url = this.getApiCallUrl('posts/update');
  request(url, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!tools.isOk(res.statusCode) || (typeof(body) !== 'object')) {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    var lastUpdateDate = new Date(body.update_time);
    callback(null, lastUpdateDate);
  });
};

exports.Client = PinboardClient;
