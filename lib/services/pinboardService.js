"use strict";
const { parseJSON } = require("../tools");
const { redisKeys } = require("../vars/pinboardVars");

class PinboardService {
  /**
   * Build a pinboard service.
   *
   * @param {object} opts
   * @param {object} opts.redisClient a redis client instance
   */
  constructor(opts) {
    this.redis = opts.redisClient;
  }

  /**
   * Retrieve the json pinboard posts from storage and parse the posts out of them.
   *
   * @param {function} callback Callback with the signature (err, posts)
   */
  getPinboardPosts(callback) {
    this.redis.get(redisKeys.posts, (err, jsonPosts) => {
      if (err) {
        callback(err);
        return;
      }

      callback(null, parseJSON(jsonPosts));
    });
  }
}

module.exports = PinboardService;
