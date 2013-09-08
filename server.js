//var api = require('./lib/api');
//var http = require('http');
var pinboardApi = require('./lib/pinboardApi');

//var port = api.get('port');
//
var pinboardApiToken = process.env['PinboardAPIToken'];
var pinboard = new pinboardApi.Pinboard(pinboardApiToken);

pinboard.getAllPosts(function (error, response, body) {
   if (!error && response.statusCode == 200) {
     console.log(body);
   }
});


//http.createServer(api).listen(port, function () {
//  console.log('web server listening at http://localhost:' + port);
//});