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

  /**
   * Retrieve a subset of items
   */
  function getPage(items, skip, limit) {
    if (!skip && !limit) {
      return items;
    }

    var start = skip || 0;
    var end = limit ? (start + limit) : undefined;

    return items.slice(start, end);
  }

  function getPageParams(req) {
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
  }

  return {
   convertMillisecondsToSeconds: convertMillisecondsToSeconds,
   noop: noop,
   getPage: getPage,
   getPageParams: getPageParams
  };
})();
