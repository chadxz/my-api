module.exports = (function () {

  var redis = require('../lib/redis'),
      pinboardUtils = require('../lib/pinboardUtils'),
      sharedUtils = require('../lib/sharedUtils');

  function showAllPosts(req, res) {
    redis.get(pinboardUtils.redisKeys.posts, function (err, jsonPosts) {
      if (err) return res.send(500);

      var pageParams;
      var posts;

      try {
        posts = JSON.parse(jsonPosts);
      } catch(e) {
        res.send(500);
        return;
      }

      try {
        pageParams = sharedUtils.getPageParams(req);
      } catch (e) {
        res.send(400, { error: e.message });
        return;
      }

      var results = sharedUtils.getPage(posts, pageParams.skip, pageParams.limit);
      res.json(results);
    });
  }

  return {
    showAllPosts: showAllPosts
  };
})();
