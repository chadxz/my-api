module.exports = (function () {

  var redis = require('../lib/redis'),
      pinboardUtils = require('../lib/pinboardUtils');

  function showAllPosts(req, res) {
    redis.get(pinboardUtils.redisKeys.posts, function (err, value) {
      res.send(value);
    });
  }

  return {
    showAllPosts: showAllPosts
  }
})();