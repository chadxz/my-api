'use strict';
var assert = require('power-assert');

describe("tools", function () {

  var tools = require('../../../lib/tools');

  describe("parseJSON", function () {

    describe("when passed valid JSON", function () {

      it("returns the parsed representation", function () {
        var result = tools.parseJSON('{ "foo": [ 1, 2, 3 ] }');
        assert.deepEqual(result, {
          foo: [ 1, 2, 3 ]
        });
      });
    });

    describe("when passed invalid JSON", function () {

      it("returns null", function () {
        var result = tools.parseJSON('{ "foo": "bar"');
        assert.equal(result, null);
      });
    });
  });
});
