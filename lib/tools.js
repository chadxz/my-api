'use strict';

var util = require('util');
var url = require('url');

/**
 * Converts milliseconds to seconds.
 *
 * @param {number} ms Milliseconds to convert
 * @returns {number} The equivalent seconds
 */
exports.toSeconds = function (ms) {
  return Math.floor(ms / 1000);
};

/**
 * A no-operation function.
 */
exports.noop = function () {
  // no operation performed
};

exports.isNan = function (supposedNumber) {
  // NaN is the only javascript value that does not equal itself
  return supposedNumber !== supposedNumber;
};

/**
 * Retrieve a subset of items
 *
 * @param {object} items the items to filter
 * @param {number} [skip=0] the number of items to skip from the beginning
 * @param {number} [limit=infinity] the number of items to limit the result to
 * @returns {object} the filtered items object
 */
exports.getPage = function (items, skip, limit) {
  if (!skip && !limit) {
    return items;
  }

  var start = typeof(skip) !== 'undefined' ? skip : 0;
  var end = typeof(limit) !== 'undefined' ? (start + limit) : undefined;

  return items.slice(start, end);
};

/**
 * Extract redis connection information out of a redis url
 *
 * @param {string} redisUrl The redis url
 * @returns {object} the redis connection params
 */
exports.parseRedisUrl = function (redisUrl) {
  var parsed = url.parse(redisUrl);
  return {
    host: parsed.hostname,
    port: parsed.port,
    password: parsed.auth.split(':')[1]
  };
};

/**
 * Generates a worker callback, suitable to be passed to a worker for logging purposes
 *
 * @param {string} workerName The name of the worker, used in log messages
 * @returns {function} the work callback configured with the specified `workerName`
 */
exports.getWorkerCallback = function (workerName) {
  return function (err, details) {
    if (err) {
      if (err instanceof Error) {
        console.error(workerName + ': ' + err.message);
        console.error(util.inspect(err, { depth: null }));
        return;
      }

      console.error(workerName + ': ' + err);
      return;
    }

    if (details) {
      console.info(workerName + ': ' + details);
      return;
    }

    console.info(workerName + ': work successful');
  };
};
