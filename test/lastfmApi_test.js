module.exports = (function () {

  var lastfmApi = require('../lib/lastfmApi');

  return {
    constructorReturnsInstanceOfLastfmUser: function constructorReturnsInstanceOfLastfmUser(test) {
      test.expect(1);

      var lastfmUserApi = new lastfmApi.LastfmUser('', '');
      test.ok(lastfmUserApi instanceof lastfmApi.LastfmUser);

      test.done();
    }
  };
})();
