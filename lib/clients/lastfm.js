'use strict';

var request = require('request');
var url = require('url');
var apiBase = 'https://ws.audioscrobbler.com/2.0/';

/**
 * Constructs an instance of the LastfmUser class, used to make API calls to pull data for a specific Last.fm user.
 *
 * @param {string} apiKey Last.fm API
 * @param {string} user The user to pull data for
 * @param {string} [responseFormat=json] The desired response format ('json' or 'xml')
 * @class LastfmUser
 */
function LastfmUser(apiKey, user, responseFormat) {
  if (!(this instanceof LastfmUser)) {
    return new LastfmUser(apiKey, user, responseFormat);
  }

  if (!apiKey) {
    throw new TypeError("param 'apiKey' (type: 'string') is required.");
  }

  if (!user) {
    throw new TypeError("param 'user' (type: 'string') is required.");
  }

  this.apiKey = apiKey;
  this.user = user;
  this.format = responseFormat || 'json';
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
    format: this.format
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

  request(url, callback);
};

exports.User = LastfmUser;
