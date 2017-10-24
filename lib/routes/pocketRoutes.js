"use strict";
const express = require("express");
const { format } = require("util");
const isAuthenticated = require("./middleware/isAuthenticated");
const { getPage } = require("../tools");
const canPaginate = require("./middleware/canPaginate");
const router = express.Router();

router.get("/authorize", isAuthenticated, (req, res) => {
  const hostHeader = req.get("host");
  const authorizeUrlFormat =
    "https://getpocket.com/auth/authorize?request_token=%s&redirect_uri=%s";
  const redirectUrlFormat = "%s://%s/pocket/authorize/callback";
  const redirectUri = format(redirectUrlFormat, req.protocol, hostHeader);

  req.services.pocket.getRequestToken(redirectUri, (err, token) => {
    if (err) {
      res.serverError(err);
      return;
    }

    req.session.requestToken = token;
    res.redirect(format(authorizeUrlFormat, token, redirectUri));
  });
});

router.get("/authorize/callback", isAuthenticated, (req, res) => {
  const { requestToken } = req.session;

  req.services.pocket.getAccessToken(requestToken, (err, authorization) => {
    if (err) {
      res.serverError(err);
      return;
    }

    if (!authorization) {
      res.serverError(new Error("Unable to retrieve access token"));
      return;
    }

    req.services.pocket.setLocalAuthorization(authorization, err => {
      if (err) {
        res.serverError(err);
        return;
      }

      req.services.pocket.startWorker();
      res.redirect("/admin");
    });
  });
});

router.get("/unlink", isAuthenticated, (req, res) => {
  req.services.pocket.removeLocalAuthorization(err => {
    if (err) {
      res.serverError(err);
      return;
    }

    req.services.pocket.removeLocalArticles(err => {
      if (err) {
        res.serverError(err);
        return;
      }

      req.services.pocket.stopWorker();
      res.redirect("/admin");
    });
  });
});

router.get("/", canPaginate, (req, res) => {
  req.services.pocket.getLocalArticles((err, articles) => {
    if (err) {
      res.serverError(err);
      return;
    }

    if (!articles) {
      res.status(200).send([]);
      return;
    }

    const { skip, limit } = req.context.paging;
    const results = getPage(articles, skip, limit);
    res.send(results);
  });
});

module.exports = router;
