'use strict';
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  req.services.pocket.getLocalAuthorization(function (err, auth) {
    if (err) {
      res.serverError(err);
      return;
    }

    res.render('admin', { pocketUsername: auth && auth.username });
  });
});

module.exports = router;
