
class OpenAPIMethod {
    constructor(method, path, body) {
        this.method = method;
        this.path = path;
        this.body = body; // defiition of the body
    }
}


function getAllMethods(openapi) {
    let methods = [];

    for (let path in openapi.paths) {
        for (let method in openapi.paths[path]) {
            methods.push(new OpenAPIMethod(
                method,
                path,
                openapi.paths[path][method]?.requestBody?.content?.['application/json']?.schema?.['$ref']
            ));
        }
    }

    return methods;
}

exports.getAllMethods = getAllMethods;