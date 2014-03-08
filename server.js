var http = require('http'),
    pinboardUtils = require('./lib/pinboardUtils'),
    lastfmUtils = require('./lib/lastfmUtils'),
    expressServer = require('./lib/expressServer'),
    port = expressServer.get('port'),
    pinboardPollRate, lastfmPollRate;

pinboardPollRate = pinboardUtils.rateLimits.defaultLimit * 2;
setInterval(function () {
  pinboardUtils.checkPinboardForFreshData(function (err, response) {
    if (err) {
      console.error(err, response);
    }
  });
}, pinboardPollRate);

lastfmPollRate = lastfmUtils.rateLimits.defaultLimit * 6;
setInterval(function () {
  lastfmUtils.checkLastfmForFreshData(function (err, response) {
    if (err) {
      console.error(err, response);
    }
  });
}, lastfmPollRate);

http.createServer(expressServer).listen(port, function () {
  console.log('web server listening on port ' + port);
});
