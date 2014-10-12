'use strict';
var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');
var routes = require('./routes');

module.exports = function (services) {
  var app = express();

  // configuration and global middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(compress());
  app.use(methodOverride());
  app.disable('x-powered-by');

  app.use(function (req, res, next) {
    // expose services to routes
    req.services = services;
    next();
  });

  // routes
  app.use('/', routes.home);
  app.use('/pinboard', routes.pinboard);
  app.use('/lastfm', routes.lastfm);

  // not found handler
  app.use(function (req, res) {
    res.status(404).send({ error: 'Not Found' });
  });

  return app;
};
