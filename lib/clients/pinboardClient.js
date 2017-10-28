"use strict";
const url = require("url");
const { isOk } = require("../tools");
const {
  RequiredParamMissingError,
  UnexpectedServerResponseError
} = require("../errors");

const request = require("request").defaults({ json: true, timeout: 5000 });
const apiBase = "https://api.pinboard.in/v1/";

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
  }

  /**
   * Concatenates the format, auth_token, and specified
   * method together to produce a fully formed Pinboard API url.
   *
   * @param {string} method The method you want to call on the api, i.e.
   *  'posts/update' or 'posts/all'
   * @returns {string} The fully formed Pinboard API url, or an empty string
   *  if {@link method} is not a string
   */
  getApiCallUrl(method) {
    if (!method) {
      throw new RequiredParamMissingError("method", "string");
    }

    const parts = url.parse(apiBase);
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
   * @param {function} callback with signature (error, allPosts)
   */
  getAllPosts(callback) {
    const url = this.getApiCallUrl("posts/all");
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

  /**
   * Make an http request to GET the date the pinboard was last updated.
   *
   * @param {function} callback with signature (err, lastUpdateDate)
   */
  getLastUpdateDate(callback) {
    const url = this.getApiCallUrl("posts/update");

    request(url, (err, res, body) => {
      if (err) {
        callback(err);
        return;
      }

      if (!isOk(res.statusCode) || typeof body !== "object") {
        callback(new UnexpectedServerResponseError(res));
        return;
      }

      const lastUpdateDate = new Date(body.update_time);
      callback(null, lastUpdateDate);
    });
  }
}

module.exports = PinboardClient;
