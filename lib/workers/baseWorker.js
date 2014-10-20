'use strict';

var errors = require('../errors');

/**
 * Base worker class. provides 'start' and 'cancel' methods.
 * Requires '_doWork' method to be implemented on implementing class.
 *
 * @param {object} opts
 * @param {object} [opts.callback] The callback that will be called each time work has been completed. Signature is (err, details)
 * @class Worker
 */
function Worker(opts) {
  opts = opts || {};
  this.callback = typeof(opts.callback) === 'function' ? opts.callback : null;
}

// class name for logging
Worker.prototype.name = 'Worker';

/**
 * Start the worker.
 *
 * @param {number} interval The interval, in milliseconds, to execute the worker.
 * @memberof Worker
 */
Worker.prototype.start = function (interval) {

  if (typeof(interval) === 'undefined') {
    throw new errors.RequiredParamMissingError('interval', 'number');
  }

  var self = this;

  function waitAndExecute() {
    return setTimeout(function () {
      self.timeoutHandle = null;

      // execute the work
      self._doWork(function (err, details) {
        if (self.callback) {
          self.callback(err, details);
        } else if (err) {
          throw err;
        }

        // once work has completed, wait for the specified time interval and execute again
        self.timeoutHandle = waitAndExecute();
      });
    }, interval);
  }

  // fire off inital timer
  this.timeoutHandle = waitAndExecute();
};

/**
 * Cancel the worker.
 *
 * @memberof Worker
 */
Worker.prototype.cancel = function () {
  if (this.timeoutHandle) {
    clearTimeout(this.timeoutHandle);
  }
};

/**
 * Worker to implement.
 *
 * @memberof Worker
 * @private
 */
Worker.prototype._doWork = function () {
  throw new Error("_doWork must be implemented on ancestors of 'Worker' class");
};

module.exports = Worker;
