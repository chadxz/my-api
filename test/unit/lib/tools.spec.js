'use strict';
var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;

describe("tools", function () {

  var tools = require('../../../lib/tools');

  describe("parseJSON", function () {

    describe("when passed valid JSON", function () {

      it("returns the parsed representation", function () {
        var result = tools.parseJSON('{ "foo": [ 1, 2, 3 ] }');
        expect(result).to.deep.equal({
          foo: [ 1, 2, 3 ]
        });
      });
    });

    describe("when passed invalid JSON", function () {

      it("returns null", function () {
        var result = tools.parseJSON('{ "foo": "bar"');
        expect(result).to.equal(null);
      });
    });
  });
});
