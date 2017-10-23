"use strict";
const express = require("express");
const router = express.Router();
const tools = require("../tools");
const canPaginate = require("./middleware/canPaginate");

// retrieve lastfm data, allowing for pagination
router.get("/", canPaginate, function(req, res) {
  req.services.lastfm.getLastfmTracks(function(err, tracks) {
    if (err) {
      res.serverError(err);
      return;
    }

    const results = tools.getPage(
      tracks,
      req.context.paging.skip,
      req.context.paging.limit
    );
    res.send(results);
  });
});

module.exports = router;
