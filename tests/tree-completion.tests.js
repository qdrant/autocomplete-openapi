"use strict";


const assert = require("assert");

const autocomplete = require("../src/trie-completion");


describe("Tree completion", () => {

    it("should construct a simple trie", () => {
        // target string:
        // POST /collections/{collection_name}/points/delete
        // POST /collections/{collection_name}/points/search

        const tokens1 = [
            "POST", "collections", "{collection_name}", "points", "delete"
        ]
        const tokens2 = [
            "POST", "collections", "{collection_name}", "points", "search"
        ]


        let trie = new autocomplete.AutocompleteTrie();

        let specialFoo = {
            "{collection_name}": [
                // match any word by regex
                (token) => token == "{collection_name}" || token.match(/\w+/),
                // complete with all words
                (token) => [],
            ]
        }

        trie.addPath(tokens1, specialFoo, "delete-points");
        trie.addPath(tokens2, specialFoo, "search-points");



        assert.equal(trie.match(tokens1), "delete-points");
        assert.equal(trie.match(tokens2), "search-points");


        const tokens3 = [
            "POST", "collections", "my_collection", "points", "delete"
        ];

        assert.equal(trie.match(tokens3), "delete-points");


        const tokens4 = [
            "POST", "collections", "my_collection", "points", "search"
        ];

        assert.equal(trie.match(tokens4), "search-points");

        const tokens5 = [
            "POST", "collections", "my_collection", "points", "search", "foo"
        ];

        assert.equal(trie.match(tokens5), null);

        // Autocolplete

        const tokens6 = [
            "POST", "collections", "my_collection", "points", "s"
        ]

        assert.deepEqual(trie.autocomplete(tokens6), ["search"]);

        const tokens7 = [
            "POST", "collections", "my_collection", "points", "del"
        ]

        assert.deepEqual(trie.autocomplete(tokens7), ["delete"]);

        const tokens8 = [
            "POST", "collections", "my_collection", "points", ""
        ]

        assert.deepEqual(trie.autocomplete(tokens8), ["delete", "search"]);

        const tokens9 = [
            "POST", "collections", "my_collection", "points", "search", "foo"
        ]

        assert.deepEqual(trie.autocomplete(tokens9), []);

        const tokens10 = [
            "POST", "collections", "my_collection", ""
        ]

        assert.deepEqual(trie.autocomplete(tokens10), ["points"]);

    });

});
