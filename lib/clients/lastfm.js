'use strict';

var request = require('request').defaults({ json: true });
var url = require('url');
var errors = require('../errors');
var apiBase = 'https://ws.audioscrobbler.com/2.0/';

/**
 * Determine whether the specified statusCode indicates a successful HTTP request.
 *
 * @param {number} statusCode The status code to check
 * @returns {boolean} Whether the statusCode is a 2xx status code.
 * @private
 */
function isOk(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Constructs an instance of the LastfmUser class, used to make API calls to pull data for a specific Last.fm user.
 *
 * @param {string} apiKey Last.fm API
 * @param {string} user The user to pull data for
 * @class LastfmUser
 */
function LastfmUser(apiKey, user) {
  if (!(this instanceof LastfmUser)) {
    return new LastfmUser(apiKey, user);
  }

  if (!apiKey) {
    throw new TypeError("param 'apiKey' (type: 'string') is required.");
  }

  if (!user) {
    throw new TypeError("param 'user' (type: 'string') is required.");
  }

  this.apiKey = apiKey;
  this.user = user;
}

/**
 * Concatenates the api_key, format, user, method, and any additional params together to produce a fully formed Last.fm API url.
 *
 * @param {string} method The method to call on the api, i.e. 'user.getRecentTracks'
 * @param {object} [additionalParams] Additional parameters for the API call using the given {@link method}
 * @returns {string} The fully formed Pinboard API url.
 * @memberof LastfmUser
 */
LastfmUser.prototype.getApiCallUrl = function (method, additionalParams) {

  if (!method) {
    throw new TypeError('param method (type: string) is required.');
  }

  method = method.toLowerCase();

  var parts = url.parse(apiBase);
  parts.query = {
    method: method,
    user: this.user,
    api_key: this.apiKey,
    format: 'json'
  };

  if (typeof(additionalParams) === 'object') {
    Object.keys(additionalParams).forEach(function (key) {
      parts.query[key] = additionalParams[key];
    });
  }

  return url.format(parts);
};


/**
 * Make an http request to GET the user's recently scrobbled tracks.
 *
 * @param {Function} callback with signature (error, response, body)
 * @memberof LastfmUser
 */
LastfmUser.prototype.getRecentTracks = function (callback) {
  var url = this.getApiCallUrl('user.getRecentTracks', { extended: '1' });

  request(url, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!isOk(res.statusCode) || (typeof(body) !== 'object')) {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    callback(null, body);
  });
};

exports.User = LastfmUser;
