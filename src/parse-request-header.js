export function tokenizeHeader(header) {

    // Remove everything after the `?` character
    let clearedHeader = header.split("?")[0];

    // Remove the leading `/`
    let methodAndPath = clearedHeader.split(/\s+/);

    // Trim whilespaces after the second part of the header
    if (methodAndPath.length == 3 && methodAndPath[2] == "") {
        methodAndPath.pop();
    }

    if (methodAndPath.length != 2) {
        return methodAndPath; // only method
    }

    let method = methodAndPath[0];
    let path = methodAndPath[1];

    path = path.replace(/^\//, "");

    let pathTokens = path.split('/');

    return [method, ...pathTokens]
}
