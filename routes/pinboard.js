var pinboardRoutes = (function () {

  var redis = require('../lib/redis');
  var pinboardUtils = require('../lib/pinboardUtils');

  var showAllPosts = function (req, res) {
    pinboardUtils.checkPinboardForFreshData(function (error) {
      redis.get(pinboardUtils.redisKeys.posts, function (err, value) {
        res.send(value);
      });
    });
  };

  return {
    showAllPosts: showAllPosts
  }
})();

module.exports = pinboardRoutes;