'use strict';

describe.skip("lastfmClient", function () {

  describe("constructor", function () {

    describe("when not passed apiKey param", function () {

      it("throws a RequiredParamMissingError", function () {

      });
    });

    describe("when not passed 'user' param", function () {

      it("throws a RequiredParamMissingError", function () {

      });
    });

    describe("when passed all required params", function () {

      describe("and the new keyword is used", function () {

        it("returns an instanceof LastfmUser", function () {

        });

        it("has apiKey and user public properties set", function () {

        });
      });

      describe("but the new keyword wasn't used", function () {

        it("still returns an instanceof LastfmUser", function () {

        });
      });
    });
  });
});
