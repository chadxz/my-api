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
 * Retrieve the page params from the given Express request.
 *
 * @param {object} req the Express request object.
 * @returns {object} the page params object
 */
exports.getPageParams = function (req) {
  var pageParams = {
    skip: req.query.skip,
    limit: req.query.limit
  };

  Object.keys(pageParams).forEach(function (key) {
    var param = pageParams[key];
    if (param) {
      try {
        param = parseInt(param);
      } catch (e) {
        throw new Error("query param '" + key + "' must be a number");
      }
    }
    pageParams[key] = param;
  });

  return pageParams;
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
 * Passed to a worker to use for reporting when work completes.
 * Meant to be partially applied, i.e. `workCallback.bind(null, 'myWorker')`.
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
