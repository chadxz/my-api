var expressServer = (function () {
  var express = require('express');
  var routes = require('../routes');

  var app = module.exports = express();

  app.set('port', process.env['PORT'] || 3000);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

  // configure routes
  app.get('/', routes.home.index);
  app.get('/pinboard', routes.pinboard.showAllPosts);

  return app;
})();

module.exports = expressServer;