"use strict";
var express = require("express");
var router = express.Router();
var tools = require("../tools");
var canPaginate = require("./middleware/canPaginate");

// retrieve pinboard data, allowing for pagination
router.get("/", canPaginate, function(req, res) {
  req.services.pinboard.getPinboardPosts(function(err, posts) {
    if (err) {
      res.serverError(err);
      return;
    }

    var results = tools.getPage(
      posts,
      req.context.paging.skip,
      req.context.paging.limit
    );
    res.send(results);
  });
});

module.exports = router;
