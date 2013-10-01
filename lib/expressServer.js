var expressServer = (function () {
  var express = require('express');
  var routes = require('../routes');

  // middleware to allow CORS
  var corser = require('corser');

  // corser option to allow XHR headers sent by jQuery
  var corserOptions = {
    requestHeaders: corser.simpleRequestHeaders.concat(["X-Requested-With"])
  };

  var app = module.exports = express();
  app.set('port', process.env['PORT'] || 3000);
  app.use(corser.create(corserOptions));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

  // respond to CORS pre-flight OPTIONS command
  app.options('*', function(req, res) {
    res.send(204);
  });

  // configure routes
  app.get('/', routes.home.showIndex);
  app.get('/pinboard', routes.pinboard.showAllPosts);

  return app;
})();

module.exports = expressServer;