import { tokenizeHeader } from "./parse-request-header.js";
import { OpenAPIExtractor } from "./openapi-extractor.js";
import { AutocompleteTrie } from "./trie-completion.js";

export class OpenapiDocs{
    constructor(openapi){
        this.openapi = openapi;
        this.extractor = new OpenAPIExtractor(openapi);

        this.methods = this.extractor.getAllMethods();

        this.trieCompletion = new AutocompleteTrie();


        for (let method of this.methods) {
            let requestString = `${method.method.toUpperCase()} ${method.path}`;
            let tokens = tokenizeHeader(requestString);
            this.trieCompletion.addPath(tokens, {}, {
                operationId: method.operationId,
                tags: method.tags
            });
        }
    }

    getRequestDocs(requestString){
        let tokens = tokenizeHeader(requestString);
        let terminal = this.trieCompletion.match(tokens);
        return terminal;
    }
}
