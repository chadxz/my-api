'use strict';

var _ = require('lodash');
var config = require('config').myApi;
var redis = require('redis');
var LastfmWorker = require('./lib/workers/lastfm');
var LastfmClient = require('./lib/clients/lastfm').User;
var tools = require('./lib/tools');
var app = require('./lib/app');
var vars = require('./lib/vars');

var port = config.port;
var redisConfig = _.clone(config.redis);
var clients = {};
var workers = {};

// setup redis client
if (redisConfig.url) {
  redisConfig = _.extend(redisConfig, tools.parseRedisUrl(config.redis.url));
}

clients.redis = redis.createClient(redisConfig.port, redisConfig.host);

if (redisConfig.password) {
  clients.redis.auth(redisConfig.password);
}

// setup api clients
clients.lastfm = new LastfmClient(config.lastfm.apiKey, config.lastfm.user);

// setup workers
workers.lastfm = new LastfmWorker({
  redisClient: clients.redis,
  lastfmClient: clients.lastfm,
  callback: tools.getWorkerCallback('lastfm')
});

// start workers
workers.lastfm.start(vars.lastfm.rateLimitsMS.globalLimit * 5);

// start http server
app.listen(port, function () {
  console.log('listening on port ' + port);
});
