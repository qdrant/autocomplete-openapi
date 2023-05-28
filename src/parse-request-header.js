function tokenizeHeader(header) {

    // Remove everything after the `?` character
    let clearedHeader = header.split("?")[0];

    // Remove the leading `/`
    let methodAndPath = clearedHeader.split(/\s+/);

    if (methodAndPath.length != 2) {
        return null;
    }

    let method = methodAndPath[0];
    let path = methodAndPath[1];

    path = path.replace(/^\//, "");

    let pathTokens = path.split('/');

    return [method, ...pathTokens]
}


exports.tokenizeHeader = tokenizeHeader;

