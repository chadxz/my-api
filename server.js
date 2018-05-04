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
const PocketWorker = require("./lib/workers/pocketWorker");
const PocketService = require("./lib/services/pocketService");
const PocketClient = require("./lib/clients/pocketClient");
const { getLoggingWorkerCallback, parseRedisUrl } = require("./lib/tools");
const vars = require("./lib/vars");

let redisConfig = cloneDeep(config.redis);

Raven.config(config.sentry.dsn, {
  environment: config.environment,
  debug: config.environment === "development",
  release: config.commit
}).install();

if (redisConfig.url) {
  redisConfig = Object.assign(redisConfig, parseRedisUrl(config.redis.url));
}

const clients = {
  redis: redis.createClient(redisConfig.port, redisConfig.host),
  lastfm: new LastfmClient(config.lastfm.apiKey, config.lastfm.user),
  pinboard: new PinboardClient(config.pinboard.apiToken),
  pocket: new PocketClient(config.pocket.consumerKey)
};

if (redisConfig.password) {
  clients.redis.auth(redisConfig.password);
}

const workers = {
  lastfm: new LastfmWorker({
    redisClient: clients.redis,
    lastfmClient: clients.lastfm,
    callback: getLoggingWorkerCallback(LastfmWorker.name)
  }),
  pinboard: new PinboardWorker({
    redisClient: clients.redis,
    pinboardClient: clients.pinboard,
    callback: getLoggingWorkerCallback(PinboardWorker.name)
  }),
  pocket: new PocketWorker({
    redisClient: clients.redis,
    pocketClient: clients.pocket,
    callback: getLoggingWorkerCallback(PocketWorker.name)
  })
};

const services = {
  lastfm: new LastfmService({ redisClient: clients.redis }),
  pinboard: new PinboardService({ redisClient: clients.redis }),
  pocket: new PocketService({
    pocketClient: clients.pocket,
    redisClient: clients.redis,
    pocketWorker: workers.pocket
  })
};

workers.lastfm.start(vars.lastfm.rateLimitsMS.defaultLimit * 5);
workers.pinboard.start(vars.pinboard.rateLimitsMS.defaultLimit * 3);
services.pocket.startWorker();

const app = require("./lib/app")(services);

app.listen(config.port, () => {
  console.log(`listening on port ${config.port}`);
});
