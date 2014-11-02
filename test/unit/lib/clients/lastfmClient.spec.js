'use strict';
var chai = require('chai');
chai.config.includeStack = true;
var should = chai.should();
var errors = require('../../../../lib/errors');

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
});
