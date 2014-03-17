module.exports = (function () {

  var redis = require('../lib/redis');
  var lastfmUtils = require('../lib/lastfmUtils');
  var sharedUtils = require('../lib/sharedUtils');

  function showRecentTracks (req, res) {
    redis.get(lastfmUtils.redisKeys.tracks, function (err, jsonTracks) {
      if (err) return res.send(500);

      var pageParams;
      var tracks;

      try {
        tracks = JSON.parse(jsonTracks).recenttracks.track;
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

      var results = sharedUtils.getPage(tracks, pageParams.skip, pageParams.limit);
      res.json(results);
    });
  }

  return {
    showRecentTracks: showRecentTracks
  };
})();
