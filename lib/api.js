var express = require('express');
var routes = require('../routes');

var api = module.exports = express();

api.set('port', process.env.PORT || 3000);
api.use(express.logger('dev'));
api.use(express.bodyParser());
api.use(express.methodOverride());
api.use(api.router);

// configure routes
api.get('/', routes.home.index);
