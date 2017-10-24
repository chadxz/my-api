"use strict";
const { RequiredParamMissingError } = require("../errors");

/**
 * Base worker class. provides 'start' and 'cancel' methods.
 * Requires '_doWork' method to be extended with functionality.
 */
class BaseWorker {
  /**
   * Create the Worker.
   *
   * @param {object} opts
   * @param {function} [opts.callback] The callback that will be called each time
   *  work has been completed. Signature is (err, details)
   */
  constructor(opts) {
    this.callback = opts.callback;
    this.timeoutHandle = null;
  }

  /**
   * Start the worker.
   *
   * @param {number} intervalMS The interval, in milliseconds, to execute the worker.
   */
  start(intervalMS) {
    if (typeof intervalMS === "undefined") {
      throw new RequiredParamMissingError("interval", "number");
    }

    // don't schedule another if already scheduled
    if (this.timeoutHandle) {
      return;
    }

    const waitAndExecute = () => {
      return setTimeout(() => {
        this.timeoutHandle = null;

        this._doWork((err, details) => {
          if (this.callback) {
            this.callback(err, details);
          } else if (err) {
            throw err;
          }

          // once work has completed, wait for the specified time interval and execute again
          this.timeoutHandle = waitAndExecute();
        });
      }, intervalMS);
    };

    // fire initial timer
    this.timeoutHandle = waitAndExecute();
    this.callback(null, "worker started");
  }

  /**
   * Cancel the worker.
   */
  cancel() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
      this.callback(null, "worker cancelled");
    }
  }

  /**
   * Work function to implement.
   *
   * @private
   */
  _doWork() {
    throw new Error("method not implemented");
  }
}

module.exports = BaseWorker;
