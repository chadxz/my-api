"use strict";
const errors = require("../../../../lib/errors");
const { URL } = require("url");

describe("lastfmClient", () => {
  const LastfmUserClient = require("../../../../lib/clients/lastfmClient").User;

  describe("constructor", () => {
    describe("when not passed apiKey param", () => {
      it("throws a RequiredParamMissingError", () => {
        expect(() => {
          // eslint-disable-next-line no-new
          new LastfmUserClient(null, "user");
        }).toThrow(errors.RequiredParamMissingError);
      });
    });

    describe("when not passed 'user' param", () => {
      it("throws a RequiredParamMissingError", () => {
        expect(() => {
          // eslint-disable-next-line no-new
          new LastfmUserClient("apiKey");
        }).toThrow(errors.RequiredParamMissingError);
      });
    });

    describe("when passed all required params", () => {
      it("returns an instanceof LastfmUser", () => {
        const client = new LastfmUserClient("apiKey", "user");
        expect(client).toBeInstanceOf(LastfmUserClient);
      });

      it("has apiKey and user public properties set", () => {
        const client = new LastfmUserClient("apiKey", "user");
        expect(client.apiKey).toEqual("apiKey");
        expect(client.user).toEqual("user");
      });
    });
  });

  describe("the getApiCallUrl public method", () => {
    describe("when called without the 'method' param", () => {
      it("throws a RequiredParamMissingError", () => {
        const client = new LastfmUserClient("myApiKey", "myUser");

        expect(() => {
          client.getApiCallUrl();
        }).toThrow(errors.RequiredParamMissingError);
      });
    });

    describe("when called with required params", () => {
      describe("and no additionalQueryParams", () => {
        it("generates a Last.fm api url for the specified method", () => {
          const client = new LastfmUserClient("myApiKey", "myUser");

          const apiUrl = client.getApiCallUrl("my.method");
          expect(apiUrl).toBeTruthy();
          const parsedApiUrl = new URL(apiUrl);
          expect(parsedApiUrl.protocol).toEqual("https:");
          expect(parsedApiUrl.host).toEqual("ws.audioscrobbler.com");
          expect(parsedApiUrl.pathname).toEqual("/2.0/");
          expect(parsedApiUrl.searchParams.get("method")).toEqual("my.method");
          expect(parsedApiUrl.searchParams.get("api_key")).toEqual("myApiKey");
          expect(parsedApiUrl.searchParams.get("user")).toEqual("myUser");
          expect(parsedApiUrl.searchParams.get("format")).toEqual("json");
        });
      });

      describe("and additionalQueryParams", () => {
        it("generates a Last.fm api url for the specified method including the additionalQueryParams", () => {
          const client = new LastfmUserClient("myApiKey", "myUser");

          const apiUrl = client.getApiCallUrl("my.method", {
            something: "special",
            foo: "bar"
          });
          expect(apiUrl).toBeTruthy();
          const parsedApiUrl = new URL(apiUrl);
          expect(parsedApiUrl.protocol).toEqual("https:");
          expect(parsedApiUrl.host).toEqual("ws.audioscrobbler.com");
          expect(parsedApiUrl.pathname).toEqual("/2.0/");
          expect(parsedApiUrl.searchParams.get("method")).toEqual("my.method");
          expect(parsedApiUrl.searchParams.get("api_key")).toEqual("myApiKey");
          expect(parsedApiUrl.searchParams.get("user")).toEqual("myUser");
          expect(parsedApiUrl.searchParams.get("format")).toEqual("json");
          expect(parsedApiUrl.searchParams.get("something")).toEqual("special");
          expect(parsedApiUrl.searchParams.get("foo")).toEqual("bar");
        });
      });
    });
  });
});
