"use strict";

/**
 * Pagination middleware to retrieve the page params from the given Express
 * request and place them in a normalized spot on the request for later request
 * handlers to use.
 *
 * @param {object} req The Express request object
 * @param {object} res The Express response object
 * @param {function} next callback to call when the request can pass through.
 */
function canPaginate(req, res, next) {
  const pageParams = {
    skip: req.query.skip,
    limit: req.query.limit
  };

  Object.keys(pageParams).forEach(key => {
    let param = pageParams[key];

    if (param) {
      param = parseInt(param);
      if (!Number.isNaN(param)) {
        pageParams[key] = param;
      } else {
        delete pageParams[key];
      }
    }
  });

  req.context = req.context || {};
  req.context.paging = {
    skip: pageParams.skip,
    limit: pageParams.limit
  };

  next();
}

module.exports = canPaginate;
