var pinboardApi = (function () {

  var request = require('request'),
      apiEndpoint = 'https://api.pinboard.in/v1/',
      Pinboard;

  /**
   * Constructs an instance of the Pinboard class, used to make API calls to the Pinboard web API.
   *
   * @param {string} apiToken Pinboard API token
   * @param {string} [responseFormat=json] The desired response format ('json' or 'xml')
   * @constructor
   */
  Pinboard = function (apiToken, responseFormat) {
    this.apiToken = apiToken;
    this.format = responseFormat || 'json';
  };

  /**
   * Concatenates the format, auth_token, and specified
   * method together to produce a fully formed Pinboard API url.
   *
   * @param {string} method The method you want to call on the api, i.e. 'posts/update' or 'posts/all'
   * @returns {string} The fully formed Pinboard API url
   */
  Pinboard.prototype.getApiCallUrl = function (method) {
    return apiEndpoint + method + '?auth_token=' + this.apiToken + '&format=' + this.format;
  };

  /**
   * Make an http request to GET all pinboard bookmarks.
   * Callback should have signature (error, response, body).
   *
   * @param {Function} callback
   */
  Pinboard.prototype.getAllPosts = function (callback) {
    var url = this.getApiCallUrl('posts/all');
    request(url, function (error, response, body) {
      callback(error, response, body);
    });
  };

  /**
   * Make an http request to GET the date the pinboard was last updated.
   * Callback should have signature (error, response, body).
   *
   * @param {Function} callback
   */
  Pinboard.prototype.getLastUpdateDate = function(callback) {
    var url = this.getApiCallUrl('posts/update');
    request(url, function(error, response, body) {
      callback(error, response, body);
    });
  };

  return {
    Pinboard: Pinboard
  };
}());

module.exports = pinboardApi;