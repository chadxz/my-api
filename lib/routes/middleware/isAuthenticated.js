"use strict";

function isAuthenticated(req, res, next) {
  if (req.user) {
    next();
    return;
  }

  res.redirect("/");
}

module.exports = isAuthenticated;
