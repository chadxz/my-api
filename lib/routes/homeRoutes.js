'use strict';
var express = require('express');
var router = express.Router();
var csrfProtection = require('csurf')();
var passport = require('passport');
var parseForm = require('body-parser').urlencoded({ extended: true });

router.get('/', csrfProtection, function (req, res) {
  if (req.user) {
    res.redirect('/admin');
    return;
  }

  res.render('login', { csrfToken: req.csrfToken() });
});

router.post('/', parseForm, csrfProtection,
  passport.authenticate('local', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/admin');
  }
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
