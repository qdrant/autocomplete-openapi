"use strict";

import assert from "assert";

import openapi from "./data/openapi.json" assert { type: "json" };

import { OpenapiAutocomplete } from "../src/autocomplete.js";
import { OpenAPIExtractor } from "../src/openapi-extractor.js";

describe("Snippets", () => {
  const extractor = new OpenAPIExtractor(openapi);

  const methods = extractor.getAllMethods();
  let theAuto = new OpenapiAutocomplete(openapi, []);

  const snippets = theAuto.getSnippets();

  it("should return snippets for all methods", () => {
    assert.ok(snippets.length === methods.length);
  });

  it("should return snippets with correct label", () => {
    for (let i = 0; i < snippets.length; i++) {
      assert.ok(snippets[i].label === methods[i].operationId);
    }
  });

  it("should return snippets with correct documentation", () => {
    for (let i = 0; i < snippets.length; i++) {
      assert.ok(snippets[i].documentation === methods[i].summary);
    }
  });

  it("should return snippets with correct insertText", () => {
    let search_matrix_pairs = snippets.find(
      (s) => s.label === "search_matrix_pairs"
    );
    assert.ok(
      search_matrix_pairs.insertText ===
        "POST /collections/${1:collection_name}/points/search/matrix/pairs"
    );

    let query_points_groups = snippets.find(
      (s) => s.label === "query_points_groups"
    );
    assert.ok(
      query_points_groups.insertText ===
        "POST /collections/${1:collection_name}/points/query/groups\n" +
          "{\n" +
          '  "group_by": $2\n' +
          "}"
    );
  });
});
