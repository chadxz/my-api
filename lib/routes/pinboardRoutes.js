"use strict";
const express = require("express");
const router = express.Router();
const { getPage } = require("../tools");
const canPaginate = require("./middleware/canPaginate");

// retrieve pinboard data, allowing for pagination
router.get("/", canPaginate, (req, res) => {
  req.services.pinboard.getPinboardPosts((err, posts) => {
    if (err) {
      res.serverError(err);
      return;
    }

    const { skip, limit } = req.context.paging;
    const results = getPage(posts, skip, limit);
    res.send(results);
  });
});

module.exports = router;
