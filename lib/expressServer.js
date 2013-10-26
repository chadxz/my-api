module.exports = (function () {
  var express = require('express'),
      routes = require('../routes'),
      corser = require('corser'),
      corserOptions, app;

  // corser option to allow XHR headers sent by jQuery
  corserOptions = {
    requestHeaders: corser.simpleRequestHeaders.concat(["X-Requested-With"])
  };

  app = express();
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