"use strict";

var util = require("util");
var url = require("url");

/**
 * Converts milliseconds to seconds.
 *
 * @param {number} ms Milliseconds to convert
 * @returns {number} The equivalent seconds
 */
exports.toSeconds = function(ms) {
  return Math.floor(ms / 1000);
};

/**
 * A no-operation function.
 */
exports.noop = function() {
  // no operation performed
};

/**
 * Try to parse the given value as JSON.
 *
 * @param {string} json The json to try to parse
 * @returns {*} The parsed JSON, or null if it is unparseable
 */
exports.parseJSON = function(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

/**
 * Determine whether the specified statusCode indicates a successful HTTP request.
 *
 * @param {number} statusCode The status code to check
 * @returns {boolean} Whether the statusCode is a 2xx status code.
 */
exports.isOk = function(statusCode) {
  return statusCode >= 200 && statusCode < 300;
};

/**
 * Retrieve a subset of items
 *
 * @param {object} items the items to filter
 * @param {number} [skip=0] the number of items to skip from the beginning
 * @param {number} [limit=infinity] the number of items to limit the result to
 * @returns {object} the filtered items object
 */
exports.getPage = function(items, skip, limit) {
  if (!skip && !limit) {
    return items;
  }

  var start = typeof skip !== "undefined" ? skip : 0;
  var end = typeof limit !== "undefined" ? start + limit : undefined;

  return items.slice(start, end);
};

/**
 * Extract redis connection information out of a redis url
 *
 * @param {string} redisUrl The redis url
 * @returns {object} the redis connection params
 */
exports.parseRedisUrl = function(redisUrl) {
  var parsed = url.parse(redisUrl);
  return {
    host: parsed.hostname,
    port: parsed.port,
    password: parsed.auth.split(":")[1]
  };
};

/**
 * Generates a worker callback, suitable to be passed to a worker for logging purposes
 *
 * @param {string} workerName The name of the worker, used in log messages
 * @returns {function} the work callback configured with the specified `workerName`
 */
exports.getLoggingWorkerCallback = function(workerName) {
  var self = this;
  return function(err, details) {
    if (err) {
      if (err instanceof Error) {
        self.logError(err, workerName + ": " + err.message);
        return;
      }

      console.error(workerName + ": " + err);
      return;
    }

    if (details) {
      console.info(workerName + ": " + details);
      return;
    }

    console.info(workerName + ": work successful");
  };
};

/**
 * Log an error, and all of its properties.
 *
 * @param {object} error The error object
 * @param {string} description A description of the context of the error
 */
exports.logError = function(error, description) {
  console.error(description, util.inspect(error, { depth: null }));
  console.error(error.stack);
};
