var pinboardApi = (function () {

  var request = require('request');
  var apiEndpoint = 'https://api.pinboard.in/v1/';

  var Pinboard = function (apiToken) {
    this.apiToken = apiToken;
    this.format = 'json'; // either 'json' or 'xml'
  };

  Pinboard.prototype.getAllPosts = function (callback) {
    var url = this.getApiCallUrl('posts/all');
    request(url, function (error, response, body) {
      callback(error, response, body);
    });
  };

  Pinboard.prototype.getApiCallUrl = function (method) {
    return apiEndpoint + method + '?auth_token=' + this.apiToken + '&format=' + this.format;
  };

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