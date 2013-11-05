module.exports = (function () {

  var lastfmApi = require('../lib/lastfmApi'),
      nock = require('nock');

  return {
    constructor_ReturnsInstance: function (test) {
      test.expect(1);

      var lastfmUserApi = new lastfmApi.LastfmUser('', '');
      test.ok(lastfmUserApi instanceof lastfmApi.LastfmUser);

      test.done();
    },

    constructor_ReturnsInstanceWithoutNewStatement: function (test) {
      test.expect(1);

      var lastfmUserApi = lastfmApi.LastfmUser('', '');
      test.ok(lastfmUserApi instanceof lastfmApi.LastfmUser);

      test.done();
    },

    constructor_SetsProperties: function (test) {
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

    constructor_SetsDefaultFormat: function (test) {
      test.expect(1);

      var lastfmUserApi = new lastfmApi.LastfmUser('', '');

      test.ok(lastfmUserApi.format && lastfmUserApi.format !== '');

      test.done();
    },

    getApiCallUrl_WhenPassedNonStringMethod_ReturnsEmptyString: function(test) {
      test.expect(1);

      var lastfmUserApi = new lastfmApi.LastfmUser('', ''),
          apiCallUrl = lastfmUserApi.getApiCallUrl(null);

      test.strictEqual(apiCallUrl, '');

      test.done();
    },

    getApiCallUrl_WhenPassedUpperCaseMethod_LowersMethodCase: function(test) {
      test.expect(1);


      var lastfmUserApi = new lastfmApi.LastfmUser('apikey', 'username'),
          methodName = 'SOMEMETHOD',
          apiCallUrl = lastfmUserApi.getApiCallUrl(methodName);

      test.ok(apiCallUrl.indexOf(methodName.toLowerCase()) > -1);

      test.done();
    },

    getApiCallUrl_WhenCalled_ReturnsValidCallUrl: function(test) {
      test.expect(4);

      var userName = 'someusername',
          apiKey = 'someapikey',
          someFormat = 'someformat',
          method = 'user.getRecentTracks',
          lastfmUserApi = new lastfmApi.LastfmUser(apiKey, userName, someFormat),
          apiCallUrl = lastfmUserApi.getApiCallUrl(method);

      test.ok(apiCallUrl.indexOf(userName) > -1);
      test.ok(apiCallUrl.indexOf(apiKey) > -1);
      test.ok(apiCallUrl.indexOf(someFormat) > -1);
      test.ok(apiCallUrl.indexOf(method.toLowerCase()) > -1);

      test.done();
    },

    getApiCallUrl_WhenCalledWithExtendedOptions_AppendsOptionsToCallUrl: function(test) {

      var key,
          options = {foo: 'bar', bam: 'baz'},
          lastfmUserApi = new lastfmApi.LastfmUser('apikey', 'username'),
          apiCallUrl = lastfmUserApi.getApiCallUrl('somemethod', options);

      test.expect(Object.keys(options).length * 2);

      for (key in options) {
        if (options.hasOwnProperty(key)) {
          test.ok(apiCallUrl.indexOf(key) > -1, key + ' not found in ' + apiCallUrl);
          test.ok(apiCallUrl.indexOf(options[key]) > -1, options[key] + ' not found in ' + apiCallUrl);
        }
      }

      test.done();
    },

    getRecentTracks_WhenCalled_MakesApiCall: function(test) {
      var apiEndpoint = 'https://ws.audioscrobbler.com',
          lastfmUserApi = new lastfmApi.LastfmUser('apikey', 'username'),
          apiMock = nock(apiEndpoint).filteringPath(/.*/, '*').get('*').reply(200);

      test.expect(1);

      lastfmUserApi.getRecentTracks(function () {
        test.ok(apiMock.isDone());
        test.done();
      });
    }
  };
})();
