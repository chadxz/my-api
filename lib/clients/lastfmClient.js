"use strict";
const { URL, URLSearchParams } = require("url");
const { isOk } = require("../tools");
const {
  RequiredParamMissingError,
  UnexpectedServerResponseError
} = require("../errors");

const request = require("request").defaults({ json: true, timeout: 5000 });
const apiBase = "https://ws.audioscrobbler.com/2.0/";

class LastfmUser {
  /**
   * Constructs an instance of the LastfmUser class, used to make API calls to
   * pull data for a specific Last.fm user.
   *
   * @param {string} apiKey Last.fm API
   * @param {string} user The user to pull data for
   */
  constructor(apiKey, user) {
    if (!apiKey) {
      throw new RequiredParamMissingError("apiKey", "string");
    }

    if (!user) {
      throw new RequiredParamMissingError("user", "string");
    }

    this.apiKey = apiKey;
    this.user = user;
  }

  /**
   * Concatenates the api_key, format, user, method, and any additional params
   * together to produce a fully formed Last.fm API url.
   *
   * @param {string} method The method to call on the api,
   *  i.e. 'user.getRecentTracks'
   * @param {object} [additionalQueryParams] Additional query parameters for the
   *  API call using the given {@link method}
   * @returns {string} The fully formed Pinboard API url.
   */
  getApiCallUrl(method, additionalQueryParams = {}) {
    if (!method) {
      throw new RequiredParamMissingError("method", "string");
    }

    method = method.toLowerCase();

    const parsedUrl = new URL(apiBase);
    parsedUrl.search = new URLSearchParams(
      Object.assign(
        {},
        {
          method: method,
          user: this.user,
          api_key: this.apiKey,
          format: "json"
        },
        additionalQueryParams
      )
    ).toString();

    return parsedUrl.href;
  }

  /**
   * Make an http request to GET the user's recently scrobbled tracks.
   *
   * @param {function} callback with signature (error, recentTracks)
   */
  getRecentTracks(callback) {
    const url = this.getApiCallUrl("user.getRecentTracks", { extended: "1" });

    request(url, (err, res, body) => {
      if (err) {
        callback(err);
        return;
      }

      if (!isOk(res.statusCode) || typeof body !== "object") {
        callback(new UnexpectedServerResponseError(res));
        return;
      }

      callback(null, body);
    });
  }
}

exports.User = LastfmUser;
