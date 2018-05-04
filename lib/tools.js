"use strict";
const util = require("util");
const url = require("url");

/**
 * Converts milliseconds to seconds.
 *
 * @param {number} ms Milliseconds to convert
 * @returns {number} The equivalent seconds
 */
function toSeconds(ms) {
  return Math.floor(ms / 1000);
}

/**
 * Try to parse the given value as JSON.
 *
 * @param {string} json The json to try to parse
 * @returns {*} The parsed JSON, or null if it is unparseable
 */
function parseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

/**
 * Determine whether the specified statusCode indicates a successful HTTP request.
 *
 * @param {number} statusCode The status code to check
 * @returns {boolean} Whether the statusCode is a 2xx status code.
 */
function isOk(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Retrieve a subset of items
 *
 * @param {object} items the items to filter
 * @param {number} [skip=0] the number of items to skip from the beginning
 * @param {number} [limit=infinity] the number of items to limit the result to
 * @returns {object} the filtered items object
 */
function getPage(items, skip, limit) {
  if (!skip && !limit) {
    return items;
  }

  const start = typeof skip !== "undefined" ? skip : 0;
  const end = typeof limit !== "undefined" ? start + limit : undefined;

  return items.slice(start, end);
}

/**
 * Extract redis connection information out of a redis url
 *
 * @param {string} redisUrl The redis url
 * @returns {object} the redis connection params
 */
function parseRedisUrl(redisUrl) {
  const parsed = url.parse(redisUrl);
  return {
    host: parsed.hostname,
    port: parsed.port,
    password: parsed.auth ? parsed.auth.split(":")[1] : ""
  };
}

/**
 * Generates a worker callback, suitable to be passed to a worker for logging purposes
 *
 * @param {string} workerName The name of the worker, used in log messages
 * @returns {function} the work callback configured with the specified `workerName`
 */
function getLoggingWorkerCallback(workerName) {
  return (err, details) => {
    if (err) {
      if (err instanceof Error) {
        logError(err, workerName + ": " + err.message);
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
}

/**
 * Log an error, and all of its properties.
 *
 * @param {object} error The error object
 * @param {string} description A description of the context of the error
 */
function logError(error, description) {
  console.error(description, util.inspect(error, { depth: null }));
  console.error(error.stack);
}

module.exports = {
  toSeconds,
  parseJSON,
  isOk,
  getPage,
  parseRedisUrl,
  getLoggingWorkerCallback,
  logError
};
