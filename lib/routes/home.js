'use strict';
var express = require('express');
var router = express.Router();

/*
 welcome mat
 */

router.get('/', function (req, res) {
  res.type('text/plain');
  res.send('ohayou gozaimasu');
});

module.exports = router;
