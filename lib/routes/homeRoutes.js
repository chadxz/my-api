"use strict";
const express = require("express");
const router = express.Router();
const csrfProtection = require("csurf")();
const passport = require("passport");
const bodyParser = require("body-parser");
const localAuth = passport.authenticate("local", { failureRedirect: "/" });
const parseForm = bodyParser.urlencoded({ extended: true });

router.get("/", csrfProtection, (req, res) => {
  if (req.user) {
    res.redirect("/admin");
    return;
  }

  const csrfToken = req.csrfToken();
  res.render("login", { csrfToken });
});

router.post("/", parseForm, csrfProtection, localAuth, (req, res) => {
  res.redirect("/admin");
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
