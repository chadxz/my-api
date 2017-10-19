"use strict";
var assert = require("power-assert");
var errors = require("../../../../lib/errors");
var url = require("url");

describe("lastfmClient", function() {
  var LastfmUserClient = require("../../../../lib/clients/lastfmClient").User;

  describe("constructor", function() {
    describe("when not passed apiKey param", function() {
      it("throws a RequiredParamMissingError", function() {
        assert.throws(function() {
          // eslint-disable-next-line no-new
          new LastfmUserClient(null, "user");
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when not passed 'user' param", function() {
      it("throws a RequiredParamMissingError", function() {
        assert.throws(function() {
          // eslint-disable-next-line no-new
          new LastfmUserClient("apiKey");
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when passed all required params", function() {
      it("returns an instanceof LastfmUser", function() {
        var client = new LastfmUserClient("apiKey", "user");
        assert(client instanceof LastfmUserClient);
      });

      it("has apiKey and user public properties set", function() {
        var client = new LastfmUserClient("apiKey", "user");
        assert.equal(client.apiKey, "apiKey");
        assert.equal(client.user, "user");
      });
    });
  });

  describe("the getApiCallUrl public method", function() {
    describe("when called without the 'method' param", function() {
      it("throws a RequiredParamMissingError", function() {
        var client = new LastfmUserClient("myApiKey", "myUser");

        assert.throws(function() {
          client.getApiCallUrl();
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when called with required params", function() {
      describe("and no additionalQueryParams", function() {
        it("generates a Last.fm api url for the specified method", function() {
          var client = new LastfmUserClient("myApiKey", "myUser");

          var apiUrl = client.getApiCallUrl("my.method");
          assert(apiUrl);
          var parsedApiUrl = url.parse(apiUrl, true);
          assert.equal(parsedApiUrl.protocol, "https:");
          assert.equal(parsedApiUrl.host, "ws.audioscrobbler.com");
          assert.equal(parsedApiUrl.pathname, "/2.0/");
          assert.deepEqual(parsedApiUrl.query, {
            method: "my.method",
            api_key: "myApiKey",
            user: "myUser",
            format: "json"
          });
        });
      });

      describe("and additionalQueryParams", function() {
        it("generates a Last.fm api url for the specified method including the additionalQueryParams", function() {
          var client = new LastfmUserClient("myApiKey", "myUser");

          var apiUrl = client.getApiCallUrl("my.method", {
            something: "special",
            foo: "bar"
          });
          assert(apiUrl);
          var parsedApiUrl = url.parse(apiUrl, true);
          assert.equal(parsedApiUrl.protocol, "https:");
          assert.equal(parsedApiUrl.host, "ws.audioscrobbler.com");
          assert.equal(parsedApiUrl.pathname, "/2.0/");
          assert.deepEqual(parsedApiUrl.query, {
            method: "my.method",
            api_key: "myApiKey",
            user: "myUser",
            format: "json",
            something: "special",
            foo: "bar"
          });
        });
      });
    });
  });
});
