"use strict";
const express = require("express");
const config = require("config").myApi;
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compress = require("compression");
const cors = require("cors");
const Raven = require("raven");
const routes = require("./routes");
const path = require("path");
const session = require("express-session");
const responses = require("./routes/responses");
const isAuthenticated = require("./routes/middleware/isAuthenticated");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const sessionSecret = config.get("session.secret");
const authenticationPassword = config.get("auth.password");

module.exports = function(services) {
  const app = express();

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
