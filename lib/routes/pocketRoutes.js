"use strict";
var express = require("express");
var util = require("util");
var isAuthenticated = require("./middleware/isAuthenticated");
var tools = require("../tools");
var canPaginate = require("./middleware/canPaginate");
var router = express.Router();

router.get("/authorize", isAuthenticated, function(req, res) {
  var authorizeUrlFormat =
    "https://getpocket.com/auth/authorize?request_token=%s&redirect_uri=%s";
  var redirectUrlFormat = "%s://%s/pocket/authorize/callback";
  var redirectUri = util.format(
    redirectUrlFormat,
    req.protocol,
    req.get("host")
  );

  req.services.pocket.getRequestToken(redirectUri, function(err, token) {
    if (err) {
      res.serverError(err);
      return;
    }

    req.session.requestToken = token;
    res.redirect(util.format(authorizeUrlFormat, token, redirectUri));
  });
});

router.get("/authorize/callback", isAuthenticated, function(req, res) {
  req.services.pocket.getAccessToken(req.session.requestToken, function(
    err,
    authorization
  ) {
    if (err) {
      res.serverError(err);
      return;
    }

    if (!authorization) {
      res.serverError(new Error("Unable to retrieve access token"));
      return;
    }

    req.services.pocket.setLocalAuthorization(authorization, function(err) {
      if (err) {
        res.serverError(err);
        return;
      }

      req.services.pocket.startWorker();
      res.redirect("/admin");
    });
  });
});

router.get("/unlink", isAuthenticated, function(req, res) {
  req.services.pocket.removeLocalAuthorization(function(err) {
    if (err) {
      res.serverError(err);
      return;
    }

    req.services.pocket.removeLocalArticles(function(err) {
      if (err) {
        res.serverError(err);
        return;
      }

      req.services.pocket.stopWorker();
      res.redirect("/admin");
    });
  });
});

router.get("/", canPaginate, function(req, res) {
  req.services.pocket.getLocalArticles(function(err, articles) {
    if (err) {
      res.serverError(err);
      return;
    }

    if (!articles) {
      res.status(200).send([]);
      return;
    }

    var results = tools.getPage(
      articles,
      req.context.paging.skip,
      req.context.paging.limit
    );
    res.send(results);
  });
});

module.exports = router;
