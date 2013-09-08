var myRedis = (function () {

  var redis = require('redis');
  var redisToGoUrl = process.env['REDISTOGO_URL'];
  var client;

  if (redisToGoUrl) {
    // deployed to heroku
    var parsedUrl = require('url').parse(redisToGoUrl);
    var password = parsedUrl.auth.split(':')[1];
    client = redis.createClient(parsedUrl.port, parsedUrl.hostname);
    client.auth(password);
  } else {
    // development
    client = redis.createClient();
  }

  return client;
})();

module.exports = myRedis;