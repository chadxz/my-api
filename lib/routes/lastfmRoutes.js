"use strict";
const express = require("express");
const router = express.Router();
const { getPage } = require("../tools");
const canPaginate = require("./middleware/canPaginate");

// retrieve lastfm data, allowing for pagination
router.get("/", canPaginate, (req, res) => {
  req.services.lastfm.getLastfmTracks((err, tracks) => {
    if (err) {
      res.serverError(err);
      return;
    }

    const { skip, limit } = req.context.paging;
    const results = getPage(tracks, skip, limit);
    res.send(results);
  });
});

module.exports = router;
