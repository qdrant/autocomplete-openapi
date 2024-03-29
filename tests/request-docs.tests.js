import assert from 'assert';

import openapi from "./data/openapi.json" assert { type: "json" };

import { OpenapiDocs } from "../src/request-docs.js";

describe("OpenAPI Docs", () => {

    const apiDocs = new OpenapiDocs(openapi)

    it("should return null for incorrect HTTP Method Name", () => {
        assert.equal(apiDocs.getRequestDocs('gat'), null)
    })

    it("should return null for comments", () => {
        assert.equal(
            apiDocs.getRequestDocs('// this is a comment'),
            null
        )
    })

    it("should return null for incomplete header", () => {
        assert.equal(apiDocs.getRequestDocs('PATCH '), null)
    })

    it("should return url for both absolute & relative valid paths", () => {
        assert.equal(
            apiDocs.getRequestDocs('GET telemetry').operationId,
            'telemetry'
        );
        assert.equal(
            apiDocs.getRequestDocs('GET /telemetry').operationId,
            'telemetry'
        );
    })

    it("should return url for valid request with path variables", () => {
        assert.equal(
            apiDocs.getRequestDocs('DELETE collections/my_collection/index/my_field').operationId,
            'delete_field_index'
        )
        assert.equal(
            apiDocs.getRequestDocs('PATCH collections/test').operationId,
            'update_collection'
        )
    })
})