var expressServer = require('./lib/expressServer');
var http = require('http');
var pinboardUtils = require('./lib/pinboardUtils');
var port = expressServer.get('port');

var pinboardPollRate = pinboardUtils.rateLimits.defaultLimit * 2;
setInterval(pinboardUtils.checkPinboardForFreshData, pinboardPollRate);

http.createServer(expressServer).listen(port, function () {
  console.log('web server listening on port ' + port);
});