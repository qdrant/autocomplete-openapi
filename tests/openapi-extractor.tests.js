"use strict";


const extractor = require("../src/openapi-extractor");
const assert = require("assert");

const openapi = require("./data/openapi.json");



describe("OpenAPI extractor", () => {

    it("should extract all methods", () => {
        let allMethods = extractor.getAllMethods(openapi);

        for (let method of allMethods) {
            console.log(method);
        }
    });

});

