import { tokenizeHeader } from "./parse-request-header.js";

const Methods = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
const response = await fetch(import.meta.env.BASE_URL + './openapi.json');
const openapi = await response.json();

function matchRequest(method,endpoint){
    const paths = Object.keys(openapi.paths);
    for (const path of paths){
        const matchReg = new RegExp('^/?' + path.slice(1,).replace(/{.*?}/g, '[-a-zA-Z0-9_<>]+') + '$');
        if(matchReg.test(endpoint)){
            if (method.toLowerCase() in openapi.paths[path]){
                const openapiDocs = openapi.paths[path][method.toLowerCase()];
                const docsURL = 'https://qdrant.github.io/qdrant/redoc/index.html#tag/' + openapiDocs.tags[0] + '/operation/' + openapiDocs.operationId;
                return docsURL;
            }
        }
    }
    return null
}

export function getRequestDocs(requestString){
    let tokens = tokenizeHeader(requestString);
    if(tokens.length < 2 || requestString.slice(0,2) == '//'){
        return null;
    }
    const method = tokens[0];
    const endpoint = tokens.slice(1).join('/')

    if (!Methods.includes(method)){
        return null
    }
    return matchRequest(method, endpoint);
}

