'use strict';

/**
 * Pagination middleware to retrieve the page params from the given Express request
 * and place them in a normalized spot on the request for later request handlers to use.
 *
 * @param {object} req The Express request object
 * @param {object} res The Express response object
 * @param {function} next callback to call when the request can pass through.
 */
module.exports = function (req, res, next) {

  var pageParams = {
    skip: req.query.skip,
    limit: req.query.limit
  };

  try {
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
  } catch (e) {
    res.status(400).send({ error: e.message });
    return;
  }

  req.context = req.context || {};
  req.context.paging = {
    skip: pageParams.skip,
    limit: pageParams.limit
  };

  next();
};
