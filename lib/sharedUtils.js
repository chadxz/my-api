module.exports = (function () {


  /**
   * Converts milliseconds to seconds.
   *
   * @param {number} ms Milliseconds to convert
   * @returns {number} The equivalent seconds
   */
  function convertMillisecondsToSeconds(ms) {
    return Math.floor(ms / 1000);
  }


  /**
   * A no-operation function.
   */
  function noop() {
    // no operation performed
  }

  return {
   convertMillisecondsToSeconds: convertMillisecondsToSeconds,
   noop: noop
  };
})();