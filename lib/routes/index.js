"use strict";
const home = require("./homeRoutes");
const admin = require("./adminRoutes");
const lastfm = require("./lastfmRoutes");
const pinboard = require("./pinboardRoutes");
const pocket = require("./pocketRoutes");

module.exports = { home, admin, lastfm, pinboard, pocket };
