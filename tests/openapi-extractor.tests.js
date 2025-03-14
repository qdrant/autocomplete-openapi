"use strict";


import assert from 'assert';

import openapi from "./data/openapi.json" assert { type: "json" };
import { OpenAPIExtractor } from "../src/openapi-extractor.js";


describe("OpenAPI extractor", () => {

    it("should extract all methods", () => {
        let allMethods = new OpenAPIExtractor(openapi).getAllMethods();

        for (let method of allMethods) {
            // console.log(method);
        }
    });

    it("should extract all method definitions", () => {
        let allMethods = new OpenAPIExtractor(openapi).getAllMethods();
        for (const method of allMethods){
            if (method.path == '/telemetry'){
                assert.equal(method.tags[0], "Service");
            }
        }
    })

    it("should extract model object by ref", () => {
        let objects = new OpenAPIExtractor(openapi).objectByRef("#/components/schemas/CreateCollection");

        // console.log(object);
    });


    it("filter completion", () => {
        let openapiExtractor = new OpenAPIExtractor(openapi);
        let objects1 = [];
        let objects2 = [];
        objects1 = openapiExtractor.objectsByPath("#/components/schemas/Filter", ["must", 0, "match"]);
        objects2 = openapiExtractor.objectsByPath("#/components/schemas/Filter", ["must", "match"]);
        assert.deepEqual(objects1, objects2);

    }); 

    it("should extract model object by path", () => {
        let objects = [];
        let openapiExtractor = new OpenAPIExtractor(openapi);

        objects = openapiExtractor.objectsByPath("#/components/schemas/CreateCollection", ["vectors", "image", "quantization_config"]);
        assert.equal(objects.length, 3); // scalar, product, binary

        objects = openapiExtractor.objectsByPath("#/components/schemas/CreateCollection", ["optimizers_config"]);
        assert.equal(objects.length, 1);

        objects = openapiExtractor.objectsByPath("#/components/schemas/CreateCollection", ["vectors", "quantization_config"]);
        assert.equal(objects.length, 4); // scalar, product, binary or VectorParams (quantization_config might be a name of a field)

        objects = openapiExtractor.objectsByPath("#/components/schemas/CreateCollection", ["vectors", "quantization_config", "scalar"]);
        assert.equal(objects.length, 1);

        objects = openapiExtractor.objectsByPath("#/components/schemas/Filter", ["must", 0, "match"]);
        assert.equal(objects.length, 4); // value, text, any, except

        objects = openapiExtractor.objectsByPath("#/components/schemas/Filter", ["must", 0, "must", 1, "match"]);
        assert.equal(objects.length, 4); // value, text, any, except
    });
});

