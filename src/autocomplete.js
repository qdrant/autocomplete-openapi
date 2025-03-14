"use strict";

import { OpenAPIExtractor } from "./openapi-extractor.js";
import { AutocompleteTrie } from "./trie-completion.js";
import { partialParseJson } from "./json-parser.js";
import { tokenizeHeader } from "./parse-request-header.js";
import { generateRequestHeader, generateResponseBody } from './snippets.js';

export class OpenapiAutocomplete {
  constructor(openapi, collections) {
    this.openapi = openapi;
    this.extractor = new OpenAPIExtractor(openapi);

    this.methods = this.extractor.getAllMethods();

    this.trieCompletion = new AutocompleteTrie();

    let specialFoo = {
      "{collection_name}": [
        // match any word by regex
        (token) => token == "{collection_name}" || token.match(/\w+/),
        // complete with all words
        (token) =>
          collections.filter((collection) => collection.startsWith(token)),
      ],
    };

    for (let method of this.methods) {
      let requestString = `${method.method.toUpperCase()} ${method.path}`;
      let tokens = tokenizeHeader(requestString);
      this.trieCompletion.addPath(tokens, specialFoo, method.body);
    }
  }

  completeRequestHeader(requestString) {
    let tokens = tokenizeHeader(requestString);
    let completions = this.trieCompletion.autocomplete(tokens);

    return completions;
  }

  /// Expect full request header, e.g. "POST /collections/my_collection/points/search"
  /// And partial request body, e.g. '{"vectors": {'
  completeRequestBody(requestHeader, requestJson) {
    let tokens = tokenizeHeader(requestHeader);
    let dataRef = this.trieCompletion.match(tokens);

    return this.completeRequestBodyByDataRef(dataRef, requestJson);
  }

  /// Expect full dataRef, e.g. "#/components/schemas/FilterRequest"
  /// And partial request body, e.g. '{"vectors": {'
  completeRequestBodyByDataRef(dataRef, requestJson) {
    if (!dataRef) {
      return [];
    }

    let jsonParsedResult = partialParseJson(requestJson);

    let editingChunk = jsonParsedResult.getEditedChunk();

    if (editingChunk.editing === "value") {
      let result = this.extractor.allEnumValues(
        dataRef,
        jsonParsedResult.path,
        editingChunk.key || "",
        editingChunk.value || ""
      );

      if (editingChunk.value === null) {
        // If there is no value, then we should autocomplete with open quote
        result = result.map((s) => '"' + s + '"');
      } else {
        // If there is a value, then we should autocomplete with closing quote only

        result = result.map((s) => s + '"');
      }
      return result;
    }

    if (editingChunk.editing === "key") {
      let result = this.extractor.allProperties(
        dataRef,
        jsonParsedResult.path,
        editingChunk.key || ""
      );

      if (editingChunk.key === null) {
        // If there is no key, then we should autocomplete with open quote

        result = result.map((s) => '"' + s + '": ');
      } else {
        // If there is a key, then we should autocomplete with closing quote only

        result = result.map((s) => s + '": ');
      }
      return result;
    }
    return [];
  }

  getSnippets() {
    let completions = [];
    for (let method of this.methods) {
      let [insertText, completionCount] = generateRequestHeader(method);

      const dataRef = method.body;
      if (dataRef) {
        let current = this.extractor.objectByRef(dataRef);
        const generatedBody = generateResponseBody(current, completionCount);
        insertText += "\n" + generatedBody;
      }

      completions.push({
        label: method.operationId,
        documentation: method.summary,
        insertText: insertText,
      });
    }

    return completions;
  }
}
