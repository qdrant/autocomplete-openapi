"use strict";

import assert from "assert";

import openapi from "./data/openapi.json" assert { type: "json" };

import { OpenapiAutocomplete } from "../src/autocomplete.js";

describe("OpenAPI autocomplete", () => {
  let theAuto = new OpenapiAutocomplete(openapi, [
    "my_collection",
    "my_collection2",
  ]);

  it("autocompleteing values: create collection distance ", () => {
    let completions = [];
    let requestHeader = "";
    let body = "";

    requestHeader = "PUT collections/my_collection";
    body = `
    {
        "vectors": {
          "size": 4,
          "distance": "D`;

    completions = theAuto.completeRequestBody(requestHeader, body);
    assert.ok(completions.includes('Dot"'));
  });

  it("autocompleteing values: Index field schema ", () => {
    let completions = [];
    let requestHeader = "";
    let body = "";

    requestHeader = "PUT collections/my_collection/index";
    body = `
    {
        "field_name": "name_of_the_field_to_index",
        "field_schema": 
        `;

    completions = theAuto.completeRequestBody(requestHeader, body);
    assert.ok(completions.includes('"keyword"'));
  });
  it("autocompleteing values : quantization_config scalar type ", () => {
    let completions = [];

    let requestHeader = "PUT collections/my_collection";
    let body = `
    {
      "vectors": {
          "size": 768,
          "distance": "Cosine"
      },
      "optimizers_config": {
          "memmap_threshold": 20000
      },
      "quantization_config": {
          "scalar": {
              "type": "i
`;

    completions = theAuto.completeRequestBody(requestHeader, body);

    assert.ok(completions.includes('int8"'));
  });

  it("autocompleteing values : quantization_config product type ", () => {
    let theAuto = new OpenapiAutocomplete(openapi, [
      "my_collection",
      "my_collection2",
    ]);

    let completions = [];
    let requestHeader = "PUT collections/test_collection";
    let body = `
    {
      "vectors": {
          "size": 768,
          "distance": "Cosine"
      },
      "optimizers_config": {
          "memmap_threshold": 20000
      },
      "quantization_config": {
          "product": {
              "compression": "x
`;

    completions = theAuto.completeRequestBody(requestHeader, body);

    assert.ok(completions.includes('x4"'));
    assert.ok(completions.includes('x8"'));
    assert.ok(completions.includes('x16"'));
    assert.ok(completions.includes('x32"'));
    assert.ok(completions.includes('x64"'));
  });
});
