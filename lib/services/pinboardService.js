"use strict";
const pinboardVars = require("../vars/pinboardVars");

/**
 * Build a pinboard service.
 *
 * @param {object} opts
 * @param {object} opts.redis a redis client instance
 * @class PinboardService
 */
function PinboardService(opts) {
  this.redis = opts.redisClient;
}

/**
 * Retrieve the json pinboard posts from storage and parse the posts out of them.
 *
 * @param {function} callback Callback with the signature (err, posts)
 * @memberof PinboardService
 */
PinboardService.prototype.getPinboardPosts = function(callback) {
  this.redis.get(pinboardVars.redisKeys.posts, function(err, jsonPosts) {
    if (err) {
      callback(new Error("Error reading pinboard posts from redis"));
      return;
    }

    let posts = null;

    try {
      posts = JSON.parse(jsonPosts);
    } catch (e) {
      callback(new Error("Error parsing pinboard posts stored in redis"));
      return;
    }

    callback(null, posts);
  });
};

module.exports = PinboardService;
