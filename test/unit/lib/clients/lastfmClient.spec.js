"use strict";
const assert = require("power-assert");
const errors = require("../../../../lib/errors");
const url = require("url");

describe("lastfmClient", () => {
  const LastfmUserClient = require("../../../../lib/clients/lastfmClient").User;

  describe("constructor", () => {
    describe("when not passed apiKey param", () => {
      it("throws a RequiredParamMissingError", () => {
        assert.throws(() => {
          // eslint-disable-next-line no-new
          new LastfmUserClient(null, "user");
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when not passed 'user' param", () => {
      it("throws a RequiredParamMissingError", () => {
        assert.throws(() => {
          // eslint-disable-next-line no-new
          new LastfmUserClient("apiKey");
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when passed all required params", () => {
      it("returns an instanceof LastfmUser", () => {
        const client = new LastfmUserClient("apiKey", "user");
        assert(client instanceof LastfmUserClient);
      });

      it("has apiKey and user public properties set", () => {
        const client = new LastfmUserClient("apiKey", "user");
        assert.equal(client.apiKey, "apiKey");
        assert.equal(client.user, "user");
      });
    });
  });

  describe("the getApiCallUrl public method", () => {
    describe("when called without the 'method' param", () => {
      it("throws a RequiredParamMissingError", () => {
        const client = new LastfmUserClient("myApiKey", "myUser");

        assert.throws(() => {
          client.getApiCallUrl();
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when called with required params", () => {
      describe("and no additionalQueryParams", () => {
        it("generates a Last.fm api url for the specified method", () => {
          const client = new LastfmUserClient("myApiKey", "myUser");

          const apiUrl = client.getApiCallUrl("my.method");
          assert(apiUrl);
          const parsedApiUrl = url.parse(apiUrl, true);
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

      describe("and additionalQueryParams", () => {
        it("generates a Last.fm api url for the specified method including the additionalQueryParams", () => {
          const client = new LastfmUserClient("myApiKey", "myUser");

          const apiUrl = client.getApiCallUrl("my.method", {
            something: "special",
            foo: "bar"
          });
          assert(apiUrl);
          const parsedApiUrl = url.parse(apiUrl, true);
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
