import { tokenizeHeader } from "./parse-request-header.js";
import { OpenAPIExtractor } from "./openapi-extractor.js";

export class OpenapiDocs{
    HTTPMethods = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

    constructor(docsBaseURL, openapi){
        this.DOCS_BASE_URL = docsBaseURL;
        this.openapi = openapi;
        this.extractor = new OpenAPIExtractor(openapi);
        this.methods = this.extractor.getMethodDefinitions();
    }

    matchRequest(method, endpoint){
        for (const request of this.methods){
            const matchReg = new RegExp('^/?' + request.path.slice(1,).replace(/{.*?}/g, '[-a-zA-Z0-9_<>]+') + '$');
            if(matchReg.test(endpoint) && request.methodDefinitions[method]){
                const docsURL = this.DOCS_BASE_URL + request.methodDefinitions[method].tags[0] + '/operation/' + request.methodDefinitions[method].operationId;
                return docsURL;
            }
        }
        return null
    }

    getRequestDocs(requestString){
        let tokens = tokenizeHeader(requestString);
        if(tokens.length < 2 || requestString.slice(0,2) == '//'){
            return null;
        }
        const method = tokens[0];
        const endpoint = tokens.slice(1).join('/')
        if (!this.HTTPMethods.includes(method)){
            return null
        }
        return this.matchRequest(method.toLowerCase(), endpoint);
    }
}
