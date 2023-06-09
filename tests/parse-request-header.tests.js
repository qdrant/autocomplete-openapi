"use strict";

import assert from 'assert';

import { tokenizeHeader } from "../src/parse-request-header.js";

describe("Parse request header", () => {

    it("should parse a simple header", () => {
        let tokens = [];

        const tokenizer = tokenizeHeader;


        tokens = tokenizer("POST /collections/{collection_name}/points/delete");
        assert.deepEqual(tokens, ["POST", "collections", "{collection_name}", "points", "delete"]);

        tokens = tokenizer("POST /collections/{collection_name}/points/search");
        assert.deepEqual(tokens, ["POST", "collections", "{collection_name}", "points", "search"]);

        tokens = tokenizer("POST /collections/{collection_name}/points/search?foo=bar");
        assert.deepEqual(tokens, ["POST", "collections", "{collection_name}", "points", "search"]);

        tokens = tokenizer("POST /collections/{collection_name}/points/search?foo=bar&baz=qux");
        assert.deepEqual(tokens, ["POST", "collections", "{collection_name}", "points", "search"]);

        tokens = tokenizer("POST /collections/{collection_name}/points/");
        assert.deepEqual(tokens, ["POST", "collections", "{collection_name}", "points", ""]);

        tokens = tokenizer("POST collections/{collection_name}/points");
        assert.deepEqual(tokens, ["POST", "collections", "{collection_name}", "points"]);

        tokens = tokenizer("lalala");
        assert.deepEqual(tokens, ["lalala"]);
    });

});

