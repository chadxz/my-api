"use strict";
const assert = require("power-assert");

describe("tools", () => {
  const tools = require("../../../lib/tools");

  describe("parseJSON", () => {
    describe("when passed valid JSON", () => {
      it("returns the parsed representation", () => {
        const result = tools.parseJSON('{ "foo": [ 1, 2, 3 ] }');
        assert.deepEqual(result, {
          foo: [1, 2, 3]
        });
      });
    });

    describe("when passed invalid JSON", () => {
      it("returns null", () => {
        const result = tools.parseJSON('{ "foo": "bar"');
        assert.equal(result, null);
      });
    });
  });
});
