"use strict";

import assert from 'assert';
import { partialParseJson } from "../src/json-parser.js";


describe("JSON partial parser", () => {

    it("should not parse empty string", () => {
        const result = partialParseJson("");
        assert.deepEqual(result.data, null);
    });

    it("should not parse garbage", () => {
        const result = partialParseJson("garbage");
        assert.deepEqual(result.data, null);
    });

    it("should return current chunk", () => {
        const result = partialParseJson('{"key": { ');

        // console.log(result);
    });

    it("should parse partial object", () => {
        let result = {};

        result = partialParseJson('{ "key": "123" ');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, '');

        result = partialParseJson('{ "key": "123", ');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',');

        result = partialParseJson('{ "key": "123", "');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"');

        result = partialParseJson('{ "key": "123", "a');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a');

        result = partialParseJson('{ "key": "123", "a"');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a"');

        result = partialParseJson('{ "key": "123", "a":');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a":');

        result = partialParseJson('{ "key": "123", "a": "');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a":"');

        result = partialParseJson('{ "key": "123", "a": "a');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, ',"a":"a');

    });

    it("should parse partial nested", () => {
        let result = {};

        result = partialParseJson('{ "key": {');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '');
        assert.equal(result.getEditedChunk().key, null);
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);



        result = partialParseJson('{ "key": { "a');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, "key");


        result = partialParseJson('{ "key": { "a"');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a"');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);

        result = partialParseJson('{ "key": { "a":');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a":');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);

        result = partialParseJson('{ "key": { "a": "');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a":"');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, "");
        assert.equal(result.getEditedChunk().editing, "value");

        result = partialParseJson('{ "key": { "a": "a');
        assert.deepEqual(result.data, {"key": {}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '"a":"a');
        assert.equal(result.getEditedChunk().key, "a");
        assert.equal(result.getEditedChunk().value, "a");
        assert.equal(result.getEditedChunk().editing, "value");

        result = partialParseJson('{ "key": { "a": "a"');
        assert.deepEqual(result.data, {"key": {"a": "a"}});
        assert.deepEqual(result.path, ["key"]);
        assert.equal(result.editedChunk, '');
        assert.equal(result.getEditedChunk().key, null);
        assert.equal(result.getEditedChunk().value, null);
        assert.equal(result.getEditedChunk().editing, null);
    });

    it("should parse partial nested array", () => {
        let result = {};

        result = partialParseJson('{ "key": [{"a": "a"}, {');
        assert.deepEqual(result.data, {"key": [{"a": "a"}, {}]});
        assert.deepEqual(result.path, ["key", 1]);
        assert.equal(result.editedChunk, '');

        result = partialParseJson('{ "key": [{"a": "a"}, {"b');
        assert.deepEqual(result.data, {"key": [{"a": "a"}, {}]});
        assert.deepEqual(result.path, ["key", 1]);
        assert.equal(result.editedChunk, '"b');

        result = partialParseJson('{"x": [], "key": [{"a": "a"}, {"b');
        assert.deepEqual(result.data, {"x": [], "key": [{"a": "a"}, {}]});
        assert.deepEqual(result.path, ["key", 1]);
        assert.equal(result.editedChunk, '"b');
    });

    it("should parse partial deep nested array", () => {
        let result = {};

        result = partialParseJson('{ "key": [{"a": "a"}, {"b": ["b", {');
        assert.deepEqual(result.data, {"key": [{"a": "a"}, {"b": ["b", {}]}]});
        assert.deepEqual(result.path, ["key", 1, "b", 1]);

    });

    it("should parse complete object", () => {
        let result = {};

        result = partialParseJson('{ "key": "123" }');
        assert.deepEqual(result.data, {"key": "123"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, '');

        result = partialParseJson('{ "key": "123", "a": "a" }');
        assert.deepEqual(result.data, {"key": "123", "a": "a"});
        assert.deepEqual(result.path, []);
        assert.equal(result.editedChunk, '');
    });

});
