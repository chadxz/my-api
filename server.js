"use strict";
const { cloneDeep } = require("lodash");
const config = require("config").myApi;
const redis = require("redis");
const Raven = require("raven");
const LastfmWorker = require("./lib/workers/lastfmWorker");
const LastfmService = require("./lib/services/lastfmService");
const LastfmClient = require("./lib/clients/lastfmClient").User;
const PinboardWorker = require("./lib/workers/pinboardWorker");
const PinboardService = require("./lib/services/pinboardService");
const PinboardClient = require("./lib/clients/pinboardClient");
const PocketService = require("./lib/services/pocketService");
const PocketClient = require("./lib/clients/pocketClient");
const PocketWorker = require("./lib/workers/pocketWorker");
const tools = require("./lib/tools");
const vars = require("./lib/vars");

const port = config.port;
let redisConfig = cloneDeep(config.redis);
const clients = {};
const workers = {};
const services = {};

Raven.config(config.sentry.dsn, {
  environment: config.environment,
  debug: config.environment === "development",
  release: config.heroku.slug
}).install();

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
const app = require("./lib/app")(services);

// start http server
app.listen(port, function() {
  console.log("listening on port " + port);
});
