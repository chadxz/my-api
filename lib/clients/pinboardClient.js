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

class PinboardClient {
  /**
   * Constructs an instance of the PinboardClient class,
   * used to make API calls to the Pinboard web API.
   *
   * @param {string} apiToken Pinboard API token
   */
  constructor(apiToken) {
    if (!apiToken) {
      throw new RequiredParamMissingError("apiToken", "string");
    }

    this.apiToken = apiToken;
    this.apiBase = "https://api.pinboard.in/v1/";
  }

  /**
   * Concatenates the format, auth_token, and specified
   * method together to produce a fully formed Pinboard API url.
   *
   * @param {string} method The method you want to call on the api, i.e.
   *  'posts/update' or 'posts/all'
   * @returns {string} The fully formed Pinboard API url, or an empty string
   *  if {@link method} is not a string
   * @private
   */
  getApiCallUrl(method) {
    if (!method) {
      throw new RequiredParamMissingError("method", "string");
    }

    const parts = url.parse(this.apiBase);
    parts.pathname = parts.path + method;
    parts.query = {
      auth_token: this.apiToken,
      format: "json"
    };

    return url.format(parts);
  }

  /**
   * Make an http request to GET all pinboard bookmarks.
   * Callback should have signature (error, response, body).
   *
   * @returns {Promise<Array>} Resolves with all posts by the user, or rejects
   *  with the error.
   */
  async getAllPosts() {
    const url = this.getApiCallUrl("posts/all");
    const response = await request(url);

    if (!Array.isArray(response.body)) {
      throw new UnexpectedServerResponseError(response);
    }

    return response.body;
  }

  /**
   * Make an http request to GET the date the pinboard was last updated.
   *
   * @returns {Promise<Date>} Resolves with the date that pinboard was last
   *  updated, or rejects with the error.
   */
  async getLastUpdateDate() {
    const url = this.getApiCallUrl("posts/update");
    const response = await request(url);

    if (typeof response.body !== "object") {
      throw new UnexpectedServerResponseError(response);
    }

    return new Date(response.body.update_time);
  }
}

module.exports = PinboardClient;
