'use strict';
var chai = require('chai');
chai.config.includeStack = true;
var should = chai.should();
var errors = require('../../../../lib/errors');
var url = require('url');

describe("lastfmClient", function () {

  var LastfmUserClient = require('../../../../lib/clients/lastfmClient').User;

  describe("constructor", function () {

    describe("when not passed apiKey param", function () {

      it("throws a RequiredParamMissingError", function () {
        should.throw(function () {
          new LastfmUserClient(null, 'user');
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when not passed 'user' param", function () {

      it("throws a RequiredParamMissingError", function () {
        should.throw(function () {
          new LastfmUserClient('apiKey');
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when passed all required params", function () {

      it("returns an instanceof LastfmUser", function () {
        var client = new LastfmUserClient('apiKey', 'user');
        client.should.be.an.instanceof(LastfmUserClient);
      });

      it("has apiKey and user public properties set", function () {
        var client = new LastfmUserClient('apiKey', 'user');
        client.should.include.property('apiKey', 'apiKey');
        client.should.include.property('user', 'user');
      });
    });
  });

  describe("the getApiCallUrl public method", function () {

    var client;
    var providedApiKey = 'myApiKey';
    var providedUser = 'myUser';

    before(function () {
      client = new LastfmUserClient(providedApiKey, providedUser);
    });

    describe("when called without the 'method' param", function () {

      it("throws a RequiredParamMissingError", function () {
        should.throw(function () {
          client.getApiCallUrl();
        }, errors.RequiredParamMissingError);
      });
    });

    describe("when called with required params", function () {

      describe("and no additionalQueryParams", function () {

        it("generates a Last.fm api url for the specified method", function () {
          var apiUrl = client.getApiCallUrl('my.method');
          should.exist(apiUrl);
          var parsedApiUrl = url.parse(apiUrl, true);
          parsedApiUrl.query.should.deep.equal({
            method: 'my.method',
            api_key: providedApiKey,
            user: providedUser,
            format: 'json'
          });
        });
      });

      describe("and additionalQueryParams", function () {

        it("generates a Last.fm api url for the specified method including the additionalQueryParams", function () {
          var apiUrl = client.getApiCallUrl('my.method', {
            something: 'special',
            foo: 'bar'
          });
          should.exist(apiUrl);
          var parsedApiUrl = url.parse(apiUrl, true);
          parsedApiUrl.query.should.deep.equal({
            method: 'my.method',
            api_key: providedApiKey,
            user: providedUser,
            format: 'json',
            something: 'special',
            foo: 'bar'
          });
        });
      });
    });
  });
});
