"use strict";


const parser = require("../src/json-parser");
const assert = require("assert");


describe("JSON partial parser", () => {

    it("should not parse empty string", () => {
        const result = parser.partialParseJson("");
        assert.deepEqual(result.data, null);
    });

    it("should not parse garbage", () => {
        const result = parser.partialParseJson("garbage");
        assert.deepEqual(result.data, null);
    });

    it("should return current chunk", () => {
        const result = parser.partialParseJson('{"key": { ');

        // console.log(result);
    });

    it("should parse partial object", () => {
        let result = {};

        result = parser.partialParseJson('{ "key": "123" ');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, '');

        result = parser.partialParseJson('{ "key": "123", ');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',');

        result = parser.partialParseJson('{ "key": "123", "');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"');

        result = parser.partialParseJson('{ "key": "123", "a');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a');

        result = parser.partialParseJson('{ "key": "123", "a"');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a"');

        result = parser.partialParseJson('{ "key": "123", "a":');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a":');

        result = parser.partialParseJson('{ "key": "123", "a": "');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a":"');

        result = parser.partialParseJson('{ "key": "123", "a": "a');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a":"a');

    });

    it("should parse partial nested", () => {
        let result = {};

        result = parser.partialParseJson('{ "key": {');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '');
        assert.equal(result.getEditedChunk().key, null);
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);



        result = parser.partialParseJson('{ "key": { "a');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, "key");


        result = parser.partialParseJson('{ "key": { "a"');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a"');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);

        result = parser.partialParseJson('{ "key": { "a":');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a":');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);

        result = parser.partialParseJson('{ "key": { "a": "');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a":"');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, "");
        assert.equal(result.getEditedChunk().editing, "value");

        result = parser.partialParseJson('{ "key": { "a": "a');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a":"a');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, "a");
        assert.equal(result.getEditedChunk().editing, "value");

        result = parser.partialParseJson('{ "key": { "a": "a"');
        assert.deepEqual(result.data, {"key": {"a": "a"}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '');
        assert.equal(result.getEditedChunk().key, null);
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);
    });

    it("should parse partial nested array", () => {
        let result = {};

        result = parser.partialParseJson('{ "key": [{"a": "a"}, {');
        assert.deepEqual(result.data, {"key": [{"a": "a"}, {}]});
        assert.deepEqual(result.path, ["key", 1]);
        assert.equal(result.editedChunk, '');

        result = parser.partialParseJson('{ "key": [{"a": "a"}, {"b');
        assert.deepEqual(result.data, {"key": [{"a": "a"}, {}]});
        assert.deepEqual(result.path, ["key", 1]);
        assert.equal(result.editedChunk, '"b');

        result = parser.partialParseJson('{"x": [], "key": [{"a": "a"}, {"b');
        assert.deepEqual(result.data, {"x": [], "key": [{"a": "a"}, {}]});
        assert.deepEqual(result.path, ["key", 1]);
        assert.equal(result.editedChunk, '"b');
    });

    it("should parse partial deep nested array", () => {
        let result = {};

        result = parser.partialParseJson('{ "key": [{"a": "a"}, {"b": ["b", {');
        assert.deepEqual(result.data, {"key": [{"a": "a"}, {"b": ["b", {}]}]});
        assert.deepEqual(result.path, ["key", 1, "b", 1]);

    });

    it("should parse complete object", () => {
        let result = {};

        result = parser.partialParseJson('{ "key": "123" }');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, '');

        result = parser.partialParseJson('{ "key": "123", "a": "a" }');
        assert.deepEqual(result.data, {"key": "123", "a": "a"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, '');
    });

});
