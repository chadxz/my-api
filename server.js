'use strict';

var app = require('./lib/app');
var port = app.get('port');

app.listen(port, function () {
  console.log('listening on port ' + port);
});
