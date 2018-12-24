//note: testing options
//  1. heavy integration tests (ie. test the commands), unit test where needed
//      -benefits:
//          -easier to develop (i can pass around complex objects, like Editors)
//          -you'll know the commands work
//      -drawbacks:
//          -i'll have to create and open an "editor" for each test (or create a
//          separate file in the project, or create a multiline string in code)
//  2. heavy unit test, a few integration tests
//      -benefits:
//          -easier to test (i'll make the functions only take in primitive/simple
//          types)
//      -drawbacks:
//          -harder to develop (i'll have to do setup in the code to avoid passing
//          in complex objects)



import assert = require("assert");



// Defines a Mocha test suite to group tests of similar kind together
describe("Extension Tests", function () {

    // Defines a Mocha unit test
    it("Something 1", function() {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});