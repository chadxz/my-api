"use strict";
const util = require("util");

/**
 * Removes properties from the response returned from the request library
 * that are not relevant to troubleshooting.
 *
 * @param {object} response The un-pruned response object.
 * @returns {object} The pruned response object.
 */
function pruneResponse(response) {
  if (!response) {
    return response;
  }

  const prunedResponse = {
    headers: response.headers,
    statusCode: response.statusCode,
    body: response.body,
  };

  if (!response.request) {
    return prunedResponse;
  }

  prunedResponse.request = {
    href: response.request.href,
    headers: response.request.headers,
    method: response.request.method,
  };

  if (!response.request.body) {
    return prunedResponse;
  }

  prunedResponse.request.body = response.request.body.toString();

  return prunedResponse;
}

/**
 * Error thrown when an http request has an unexpected server response.
 *
 * @param {object} [response] the unexpected server response, included in the error object as the 'res' property.
 * @constructor
 * @augments Error
 */
function UnexpectedServerResponseError(response) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.message = "unexpected response from server";
  this.res = pruneResponse(response);
  this.name = "UnexpectedServerResponseError";
}

util.inherits(UnexpectedServerResponseError, Error);

exports.UnexpectedServerResponseError = UnexpectedServerResponseError;

/**
 * Error thrown when a required parameter is not supplied to a method. Can optionally
 * be passed a paramType to be included in the error message.
 *
 * @param {string} paramName the name of the param to include in the error message.
 * @param {string} [paramType] the type of the param to include in error message.
 * @constructor
 * @augments TypeError
 */
function RequiredParamMissingError(paramName, paramType) {
  if (!paramName) {
    throw new TypeError("paramName is required");
  }

  TypeError.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.message = "parameter '" + paramName + "'";

  if (paramType) {
    this.message += " (type: " + paramType + ")";
  }

  this.message += " is required.";

  this.name = "RequiredParamMissingError";
}

util.inherits(RequiredParamMissingError, TypeError);

exports.RequiredParamMissingError = RequiredParamMissingError;
