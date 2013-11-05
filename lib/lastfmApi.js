module.exports = (function() {
  var apiEndpoint = 'https://ws.audioscrobbler.com/2.0/',
      request = require('request'),
      util = require('util');

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
    var urlFormat, url, key;

    if (typeof(method) !== typeof('')) {
      return '';
    }

    method = method.toLowerCase();
    urlFormat = apiEndpoint + '?method=%s&user=%s&api_key=%s&format=%s';
    url = util.format(urlFormat, method, this.user, this.apiKey, this.format);

    if (additionalParams) {
      // add additionalParams to url
      for (key in additionalParams) {
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
    var params = { extended: '1' },
        url = this.getApiCallUrl('user.getRecentTracks', params);

    request(url, callback);
  };

  return {
    LastfmUser: LastfmUser
  };
})();