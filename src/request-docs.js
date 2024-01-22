import { tokenizeHeader } from "./parse-request-header.js";
import { OpenAPIExtractor } from "./openapi-extractor.js";
import { AutocompleteTrie } from "./trie-completion.js";

export class OpenapiDocs{
    constructor(docsBaseURL, openapi){
        this.DOCS_BASE_URL = docsBaseURL;
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
        let terminal= this.trieCompletion.match(tokens);
        if(terminal){
            const docsURL = this.DOCS_BASE_URL + terminal.tags[0] + '/operation/' + terminal.operationId;
            return docsURL;
        }
        return null;

    }
}
