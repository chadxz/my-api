var expressServer = require('./lib/expressServer');
var http = require('http');

var port = expressServer.get('port');

http.createServer(expressServer).listen(port, function () {
  console.log('web server listening on port ' + port);
});