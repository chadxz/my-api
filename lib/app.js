"use strict";
var express = require("express");
var config = require("config").myApi;
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var compress = require("compression");
var cors = require("cors");
var Raven = require("raven");
var routes = require("./routes");
var path = require("path");
var session = require("express-session");
var responses = require("./routes/responses");
var isAuthenticated = require("./routes/middleware/isAuthenticated");
var passport = require("passport");
var LocalStrategy = require("passport-local");

var sessionSecret = config.get("session.secret");
var authenticationPassword = config.get("auth.password");

module.exports = function(services) {
  var app = express();

  app.use(Raven.requestHandler());

  // configure passport for admin authentication
  passport.use(
    new LocalStrategy(function(username, password, done) {
      done(null, authenticationPassword === password);
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, true);
  });

  passport.deserializeUser(function(id, done) {
    done(null, true);
  });

  // configuration and global middleware
  app.use(cors());
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(compress());
  app.use(methodOverride());
  app.use(
    session({
      name: "session",
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.disable("x-powered-by");
  app.set("view engine", "jade");
  app.set("views", path.join(__dirname, "views"));

  // expose services to routes
  app.use(function(req, res, next) {
    req.services = services;
    next();
  });

  // expose custom response methods to routes
  app.use(function(req, res, next) {
    Object.keys(responses).forEach(function(key) {
      if (res.hasOwnProperty(key)) {
        console.warn(
          "responses: overwriting key '" +
            key +
            "' on response with custom response method"
        );
      }
      res[key] = responses[key].bind({
        req: req,
        res: res
      });
    });
    next();
  });

  // routes
  app.use("/", routes.home);
  app.use("/admin", isAuthenticated, routes.admin);
  app.use("/pocket", routes.pocket);
  app.use("/pinboard", routes.pinboard);
  app.use("/lastfm", routes.lastfm);

  // not found handler
  app.use(function(req, res) {
    res.status(404).send({ error: "Not Found" });
  });

  // error handler
  app.use(Raven.errorHandler());

  return app;
};
