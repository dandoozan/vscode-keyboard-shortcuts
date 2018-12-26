import { equal } from "assert";

describe("Extension Tests", function () {

    it("Something 1", function() {
        equal(-1, [1, 2, 3].indexOf(5));
        equal(-1, [1, 2, 3].indexOf(0));
    });
});

