module.exports = (function () {

  var redis = require('redis'),
      redisToGoUrl = process.env['REDISTOGO_URL'],
      client, parsedUrl, password;

  if (redisToGoUrl) {
    // deployed to heroku
    parsedUrl = require('url').parse(redisToGoUrl);
    password = parsedUrl.auth.split(':')[1];
    client = redis.createClient(parsedUrl.port, parsedUrl.hostname);
    client.auth(password);
  } else {
    // development
    client = redis.createClient();
  }

  return client;
})();