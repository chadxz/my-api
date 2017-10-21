"use strict";

var { cloneDeep } = require("lodash");
var config = require("config").myApi;
var redis = require("redis");
var LastfmWorker = require("./lib/workers/lastfmWorker");
var LastfmService = require("./lib/services/lastfmService");
var LastfmClient = require("./lib/clients/lastfmClient").User;
var PinboardWorker = require("./lib/workers/pinboardWorker");
var PinboardService = require("./lib/services/pinboardService");
var PinboardClient = require("./lib/clients/pinboardClient");
var PocketService = require("./lib/services/pocketService");
var PocketClient = require("./lib/clients/pocketClient");
var PocketWorker = require("./lib/workers/pocketWorker");
var tools = require("./lib/tools");
var vars = require("./lib/vars");

var app;
var port = config.port;
var redisConfig = cloneDeep(config.redis);
var clients = {};
var workers = {};
var services = {};

// setup redis client
if (redisConfig.url) {
  redisConfig = Object.assign(
    redisConfig,
    tools.parseRedisUrl(config.redis.url)
  );
}

clients.redis = redis.createClient(redisConfig.port, redisConfig.host);

if (redisConfig.password) {
  clients.redis.auth(redisConfig.password);
}

// setup api clients
clients.lastfm = new LastfmClient(config.lastfm.apiKey, config.lastfm.user);
clients.pinboard = new PinboardClient(config.pinboard.apiToken);
clients.pocket = new PocketClient(config.pocket.consumerKey);

// setup workers
workers.lastfm = new LastfmWorker({
  redisClient: clients.redis,
  lastfmClient: clients.lastfm,
  callback: tools.getLoggingWorkerCallback(LastfmWorker.name)
});

workers.pinboard = new PinboardWorker({
  redisClient: clients.redis,
  pinboardClient: clients.pinboard,
  callback: tools.getLoggingWorkerCallback(PinboardWorker.name)
});

workers.pocket = new PocketWorker({
  redisClient: clients.redis,
  pocketClient: clients.pocket,
  callback: tools.getLoggingWorkerCallback(PocketWorker.name)
});

// setup services
services.lastfm = new LastfmService({
  redisClient: clients.redis
});

services.pinboard = new PinboardService({
  redisClient: clients.redis
});

services.pocket = new PocketService({
  pocketClient: clients.pocket,
  redisClient: clients.redis,
  pocketWorker: workers.pocket
});

// start workers
workers.lastfm.start(vars.lastfm.rateLimitsMS.defaultLimit * 5);
workers.pinboard.start(vars.pinboard.rateLimitsMS.defaultLimit * 3);
services.pocket.startWorker();

// initialize app
app = require("./lib/app")(services);

// start http server
app.listen(port, function() {
  console.log("listening on port " + port);
});
