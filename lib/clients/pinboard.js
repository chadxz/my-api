'use strict';

var request = require('request');
var url = require('url');
var apiBase = 'https://api.pinboard.in/v1/';

/**
 * Constructs an instance of the Pinboard class, used to make API calls to the Pinboard web API.
 *
 * @param {string} apiToken Pinboard API token
 * @param {string} [responseFormat=json] The desired response format ('json' or 'xml')
 * @constructor
 */
function Pinboard(apiToken, responseFormat) {
  if (!(this instanceof Pinboard)) {
    return new Pinboard(apiToken, responseFormat);
  }

  if (!apiToken) {
    throw new TypeError('param apiToken (type: string) is required.');
  }


  this.apiToken = apiToken;
  this.format = responseFormat || 'json';
}

/**
 * Concatenates the format, auth_token, and specified
 * method together to produce a fully formed Pinboard API url.
 *
 * @param {string} method The method you want to call on the api, i.e. 'posts/update' or 'posts/all'
 * @returns {string} The fully formed Pinboard API url, or an empty string if {@link method} is not a string
 */
Pinboard.prototype.getApiCallUrl = function (method) {

  if (!method) {
    throw new TypeError('param method (type: string) is required.');
  }

  var parts = url.parse(apiBase);
  parts.search = { auth_token: this.apiToken, format: this.format };
  return url.format(parts);
};

/**
 * Make an http request to GET all pinboard bookmarks.
 * Callback should have signature (error, response, body).
 *
 * @param {Function} callback
 */
Pinboard.prototype.getAllPosts = function (callback) {
  var url = this.getApiCallUrl('posts/all');
  request(url, callback);
};

/**
 * Make an http request to GET the date the pinboard was last updated.
 * Callback should have signature (error, response, body).
 *
 * @param {Function} callback
 */
Pinboard.prototype.getLastUpdateDate = function (callback) {
  var url = this.getApiCallUrl('posts/update');
  request(url, callback);
};
