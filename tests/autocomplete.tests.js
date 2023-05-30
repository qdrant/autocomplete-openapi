"use strict";


import assert from 'assert';

import openapi from "./data/openapi.json" assert { type: "json" };

import { OpenapiAutocomplete } from "../src/autocomplete.js";


describe("OpenAPI autocomplete", () => {

    it("should autocomplete request head", () => {

        let theAuto = new OpenapiAutocomplete(openapi, ["my_collection", "my_collection2"]);

        let completions = [];


        completions = theAuto.completeRequestHeader("P");

        assert.ok(completions.includes("POST"));
        assert.ok(completions.includes("PUT"));
        assert.ok(completions.includes("PATCH"));
        
        completions = theAuto.completeRequestHeader("POST ");

        assert.ok(completions.includes("collections"));
        assert.ok(completions.includes("cluster"));
        assert.ok(completions.includes("snapshots"));

        completions = theAuto.completeRequestHeader("POST /");

        assert.ok(completions.includes("collections"));
        assert.ok(completions.includes("cluster"));
        assert.ok(completions.includes("snapshots"));


        completions = theAuto.completeRequestHeader("POST colle");

        assert.deepEqual(completions, ["collections"]);

        completions = theAuto.completeRequestHeader("POST /colle");

        assert.deepEqual(completions, ["collections"]);


        completions = theAuto.completeRequestHeader("POST /collections/");

        assert.ok(completions.includes("my_collection"));
        assert.ok(completions.includes("my_collection2"));

        completions = theAuto.completeRequestHeader("POST /collections/my_collection/");

        assert.ok(completions.includes("points"));
        assert.ok(completions.includes("snapshots"));
        assert.ok(completions.includes("cluster"));
    });

    it("should autocomplete request body", () => {

        let theAuto = new OpenapiAutocomplete(openapi, ["my_collection", "my_collection2"]);


        let completions = [];
        let requestHeader = ""
        let body = "";

        requestHeader = "POST /collections/my_collection/points/search";

        completions = theAuto.completeRequestBody(requestHeader, '{"vector": {"');

        assert.ok(completions.includes('name": '));
        assert.ok(completions.includes('vector": '));

        completions = theAuto.completeRequestBody(requestHeader, '{"v');
        assert.deepEqual(completions, ['vector": ']);

        requestHeader = "PUT /collections/demo1";
        body = `
        {
            "optimizers_config": {
                "default_segment_number": 12    
            },
            `;
        
        completions = theAuto.completeRequestBody(requestHeader, body);
        assert.ok(completions.includes('"hnsw_config": '));

        requestHeader = "PUT /collections/demo1";
        body = `
        {
            "optimizers_config": {
                "default_segment_number": 12    
            },
            "`;
        
        completions = theAuto.completeRequestBody(requestHeader, body);
        assert.ok(completions.includes('hnsw_config": '));

        requestHeader = "PUT /collections/demo1";
        body = `
        {
            "optimizers_config": {
                "default_segment_number": 12    
            }, `;
        
        completions = theAuto.completeRequestBody(requestHeader, body);
        assert.ok(completions.includes('"hnsw_config": '));

        console.log("completions", completions);
    });
});