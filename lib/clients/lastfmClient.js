"use strict";
const url = require("url");
const rp = require("request-promise-native");

const {
  RequiredParamMissingError,
  UnexpectedServerResponseError
} = require("../errors");

const request = rp.defaults({
  json: true,
  timeout: 5000,
  resolveWithFullResponse: true
});

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
    this.apiBase = "https://ws.audioscrobbler.com/2.0/";
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
   * @private
   */
  getApiCallUrl(method, additionalQueryParams = {}) {
    if (!method) {
      throw new RequiredParamMissingError("method", "string");
    }

    const parts = url.parse(this.apiBase);
    parts.query = Object.assign(
      {
        method: method.toLowerCase(),
        user: this.user,
        api_key: this.apiKey,
        format: "json"
      },
      additionalQueryParams
    );

    return url.format(parts);
  }

  /**
   * Make an http request to GET the user's recently scrobbled tracks.
   *
   * @returns {Promise<Object>} Resolves with the recent tracks for the user.
   *  Rejects with the error if an error occurs.
   */
  async getRecentTracks() {
    const url = this.getApiCallUrl("user.getRecentTracks", { extended: "1" });
    const response = await request(url);

    if (typeof response.body !== "object") {
      throw new UnexpectedServerResponseError(response);
    }

    return response.body;
  }
}

exports.User = LastfmUser;
