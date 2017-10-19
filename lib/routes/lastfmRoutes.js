"use strict";
var express = require("express");
var router = express.Router();
var tools = require("../tools");
var canPaginate = require("./middleware/canPaginate");

// retrieve lastfm data, allowing for pagination
router.get("/", canPaginate, function(req, res) {
  req.services.lastfm.getLastfmTracks(function(err, tracks) {
    if (err) {
      res.serverError(err);
      return;
    }

    var results = tools.getPage(
      tracks,
      req.context.paging.skip,
      req.context.paging.limit
    );
    res.send(results);
  });
});

module.exports = router;
