'use strict';
var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');
var routes = require('./routes');
var responses = require('./routes/responses');

module.exports = function (services) {
  var app = express();

  // configuration and global middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(compress());
  app.use(methodOverride());
  app.disable('x-powered-by');

  // expose services to routes
  app.use(function (req, res, next) {
    req.services = services;
    next();
  });

  // expose custom response methods to routes
  app.use(function (req, res, next) {
    Object.keys(responses).forEach(function (key) {
      if (res.hasOwnProperty(key)) {
        console.warn("responses: overwriting key '" + key + "' on response with custom response method");
      }
      res[key] = responses[key].bind({
        req: req,
        res: res
      });
    });
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
