module.exports = (function () {

  var lastfmApi = require('../lib/lastfmApi');

  return {
    constructorWorks: function (test) {
      test.expect(1);

      var lastfmUserApi = new lastfmApi.LastfmUser('', '');
      test.ok(lastfmUserApi instanceof lastfmApi.LastfmUser);

      test.done();
    },

    constructorWorksWithoutNewStatement: function (test) {
      test.expect(1);

      var lastfmUserApi = lastfmApi.LastfmUser('', '');
      test.ok(lastfmUserApi instanceof lastfmApi.LastfmUser);

      test.done();
    },

    constructorSetsProperties: function (test) {
      test.expect(3);

      var apiKey = 'someapikey',
          userName = 'someusername',
          format = 'someformat',
          lastfmUserApi = new lastfmApi.LastfmUser(apiKey, userName, format);

      test.strictEqual(lastfmUserApi.apiKey, apiKey);
      test.strictEqual(lastfmUserApi.user, userName);
      test.strictEqual(lastfmUserApi.format, format);

      test.done();
    },

    constructorSetsDefaultFormat: function (test) {
      test.expect(1);

      var lastfmUserApi = new lastfmApi.LastfmUser('', '');

      test.ok(lastfmUserApi.format && lastfmUserApi.format !== '');

      test.done();
    }
  };
})();
