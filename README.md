
# OpenAPI request autocomplete

A small library that provides an autocomplete for OpenAPI requests, which looks like this:


```
POST /collections/{collection_name}/points/scroll

{
    "filter": {
        "must_not": [
            { "key": "city", "match": { "value": "London" } },
            { "key": "color", "match": { "value": "red" } }
        ]
    }
}
```

Which parts are autocompleted?

* The HTTP method (GET, POST, PUT, DELETE, PATCH)
* The path (e.g. `/collections/{collection_name}/points/scroll`)
* Keys in the request body (e.g. `filter`, `must_not`, `key`, `match`, `value`)


Use OpenAPI v3 schemas for autocompletion. The schemas can be provided as a JSON file.