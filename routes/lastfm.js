module.exports = (function () {

  var redis = require('../lib/redis'),
      lastfmUtils = require('../lib/lastfmUtils');

  function showRecentTracks (req, res) {
    redis.get(lastfmUtils.redisKeys.tracks, function (err, tracks) {
       res.send(tracks);
    });
  }

  return {
    showRecentTracks: showRecentTracks
  }
})();