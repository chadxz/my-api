"use strict";

var tools = require("../../tools");

/**
 * Send a 500 status code and log the error.
 *
 * @param {object} error The error that occured.
 * @param {string} [description='Internal Server Error'] A description of the context of the error
 */
module.exports = function(error, description) {
  tools.logError(error, description || "Internal Server Error");
  this.res.status(500).end();
};
