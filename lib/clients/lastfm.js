'use strict';

var apiEndpoint = 'https://ws.audioscrobbler.com/2.0/';
var request = require('request');
var util = require('util');

/**
 * Constructs an instance of the LastfmUser class, used to make API calls to pull data for a specific Last.fm user.
 *
 * @param {string} apiKey Last.fm API
 * @param {string} user The user to pull data for
 * @param {string} [responseFormat=json] The desired response format ('json' or 'xml')
 * @constructor
 */
function LastfmUser(apiKey, user, responseFormat) {
  if (!(this instanceof LastfmUser)) {
    return new LastfmUser(apiKey, user, responseFormat);
  }

  this.apiKey = apiKey;
  this.user = user;
  this.format = responseFormat || 'json';
  return this;
}

/**
 * Concatenates the api_key, format, user, method, and any additional params together to produce a fully formed Last.fm API url.
 *
 * @param {string} method The method to call on the api, i.e. 'user.getRecentTracks'
 * @param {object} [additionalParams] Additional parameters for the API call using the given {@link method}
 * @returns {string} The fully formed Pinboard API url, or an empty string if {@link method} is not a string
 */
LastfmUser.prototype.getApiCallUrl = function (method, additionalParams) {

  if (!method) {
    throw new TypeError('param method (type: string) is required.');
  }

  method = method.toLowerCase();
  var urlFormat = apiEndpoint + '?method=%s&user=%s&api_key=%s&format=%s';
  var url = util.format(urlFormat, method, this.user, this.apiKey, this.format);

  if (additionalParams) {
    // add additionalParams to url
    for (var key in additionalParams) {
      if (additionalParams.hasOwnProperty(key)) {
        url = url + '&' + key + '=' + additionalParams[key];
      }
    }
  }

  return url;
};


/**
 * Make an http request to GET the user's recently scrobbled tracks.
 * Callback should have signature (error, response, body).
 *
 * @param {Function} callback
 */
LastfmUser.prototype.getRecentTracks = function (callback) {
  var params = { extended: '1' };
  var url = this.getApiCallUrl('user.getRecentTracks', params);

  request(url, callback);
};

module.exports = LastfmUser;
