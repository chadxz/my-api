"use strict";
const url = require("url");
const tools = require("../tools");
const errors = require("../errors");
const request = require("request").defaults({ json: true, timeout: 5000 });
const apiBase = "https://ws.audioscrobbler.com/2.0/";

/**
 * Constructs an instance of the LastfmUser class, used to make API calls to pull data for a specific Last.fm user.
 *
 * @param {string} apiKey Last.fm API
 * @param {string} user The user to pull data for
 * @class LastfmUser
 */
function LastfmUser(apiKey, user) {
  if (!apiKey) {
    throw new errors.RequiredParamMissingError("apiKey", "string");
  }

  if (!user) {
    throw new errors.RequiredParamMissingError("user", "string");
  }

  this.apiKey = apiKey;
  this.user = user;
}

/**
 * Concatenates the api_key, format, user, method, and any additional params together to produce a fully formed Last.fm API url.
 *
 * @param {string} method The method to call on the api, i.e. 'user.getRecentTracks'
 * @param {object} [additionalQueryParams] Additional query parameters for the API call using the given {@link method}
 * @returns {string} The fully formed Pinboard API url.
 * @memberof LastfmUser
 */
LastfmUser.prototype.getApiCallUrl = function(method, additionalQueryParams) {
  if (!method) {
    throw new errors.RequiredParamMissingError("method", "string");
  }

  method = method.toLowerCase();

  const parts = url.parse(apiBase);
  parts.query = {
    method: method,
    user: this.user,
    api_key: this.apiKey,
    format: "json"
  };

  if (typeof additionalQueryParams === "object") {
    parts.query = Object.assign(parts.query, additionalQueryParams);
  }

  return url.format(parts);
};

/**
 * Make an http request to GET the user's recently scrobbled tracks.
 *
 * @param {Function} callback with signature (error, recentTracks)
 * @memberof LastfmUser
 */
LastfmUser.prototype.getRecentTracks = function(callback) {
  const url = this.getApiCallUrl("user.getRecentTracks", { extended: "1" });

  request(url, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!tools.isOk(res.statusCode) || typeof body !== "object") {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    callback(null, body);
  });
};

exports.User = LastfmUser;
