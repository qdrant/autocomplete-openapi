"use strict";

import { OpenAPIExtractor } from "./openapi-extractor.js";
import { AutocompleteTrie } from "./trie-completion.js";
import { partialParseJson } from "./json-parser.js";
import { tokenizeHeader } from "./parse-request-header.js";


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
                (token) => collections.filter((collection) => collection.startsWith(token)),
            ]
        }

        for (let method of this.methods) {
            let requestString = `${method.method.toUpperCase()} ${method.path}`;
            let tokens = tokenizeHeader(requestString);
            this.trieCompletion.addPath(tokens, specialFoo, method.body);
        }
    }

    completeRequestHeader(requestString) {
        let tokens = tokenizeHeader(requestString);
        let completions = this.trieCompletion.autocomplete(tokens);

        return completions
    }

    /// Expect full request header, e.g. "POST /collections/my_collection/points/search"
    /// And partial request body, e.g. '{"vectors": {'
    completeRequestBody(requestHeader, requestJson) {
        let tokens = tokenizeHeader(requestHeader);
        let dataRef = this.trieCompletion.match(tokens);
        
        if (!dataRef) {
            return [];
        }

        let jsonParsedResult = partialParseJson(requestJson);

        let editingChunk = jsonParsedResult.getEditedChunk();

        if (editingChunk.editing !== "key") {
            // ToDo: also try to complete values
            return [];
        }

        let result = this.extractor.allProperties(dataRef, jsonParsedResult.path, editingChunk.key || "");

        if (editingChunk.key === null) {
            // If there is no key, then we should autocomplete with open quote

            result = result.map((s) => '"' + s + '": ');
        } else {
            // If there is a key, then we should autocomplete with closing quote only

            result = result.map((s) => s + '": ');
        }

        return result;
    }

    /// Expect full dataRef, e.g. "#/components/schemas/FilterRequest"
    /// And partial request body, e.g. '{"vectors": {'
    completeRequestBodyByDataRef(dataRef, requestJson) {
        if (!dataRef) {
            return [];
        }

        let jsonParsedResult = partialParseJson(requestJson);

        let editingChunk = jsonParsedResult.getEditedChunk();

        if (editingChunk.editing !== "key") {
            // ToDo: also try to complete values
            return [];
        }

        let result = this.extractor.allProperties(dataRef, jsonParsedResult.path, editingChunk.key || "");

        if (editingChunk.key === null) {
            // If there is no key, then we should autocomplete with open quote

            result = result.map((s) => '"' + s + '": ');
        } else {
            // If there is a key, then we should autocomplete with closing quote only

            result = result.map((s) => s + '": ');
        }

        return result;
    }
}
