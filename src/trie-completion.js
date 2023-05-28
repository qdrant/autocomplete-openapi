


class AutocompleteTrieNone {
    constructor(name, accepted, completable) {
        this.name = name; // name of the node
        this.accepted = accepted; // function which decides if the token is accepted as a full token, returns true or false
        this.completable = completable; // function which decides if the token is completable, returns a list of possible continuations or null if not completable
        this.children = []; // possible continuations. default is "" => AutocompleteTrieNone
        this.terminal = null; // if this is a terminal node, this is the terminal value
    }

    addChildren(trieNode) {
        this.children.push(trieNode);
    }

    setTerminal(terminal) {
        this.terminal = terminal;
    }
}


class AutocompleteTrie {
    constructor() {
        this.root = new AutocompleteTrieNone(
            "root",
            (token) => true,
            (token) => [],
        )
    }

    _match(path) {
        let current = this.root;

        for (let pathToken of path) {
            let found = false;
            for (let child of current.children) {
                if (child.accepted(pathToken)) {
                    current = child;
                    found = true;
                    break;
                }
            }

            if (!found) {
                return null;
            }
        }

        return current;
    }

    autocomplete(path) {
        if (path.length == 0) {
            return [];
        }

        let pathButLast = path.slice(0, path.length - 1);

        let lastToken = path[path.length - 1];

        let current = this._match(pathButLast);

        if (!current) {
            return [];
        }

        let completions = [];
        for (let child of current.children) {
            completions.push(...child.completable(lastToken));
        }

        return completions;
    }


    match(path) {
        let current = this._match(path);

        if (!current) {
            return null;
        }

        return current.terminal;
    }

    addPath(path, specialFoo = {}, idx = null) {
        let current = this.root;

        for (let pathToken of path) {

            let found = false;
            for (let child of current.children) {
                if (child.accepted(pathToken)) {
                    current = child;
                    found = true;
                    break;
                }
            }

            if (found) {
                continue;   
            }
            
            let newChild = null;
            if (specialFoo[pathToken]) {
                // Special functions to extract tokens
                newChild = new AutocompleteTrieNone(
                    pathToken,
                    specialFoo[pathToken][0],
                    specialFoo[pathToken][1]
                );
            } else {
                // No child found, add a new one
                newChild = new AutocompleteTrieNone(
                    pathToken,
                    (token) => pathToken === token,
                    (token) => pathToken.startsWith(token) ? [pathToken] : []
                );
            }

            current.addChildren(newChild);
            current = newChild;
        }

        current.setTerminal(idx);
    }
}


exports.AutocompleteTrieNone = AutocompleteTrieNone;
exports.AutocompleteTrie = AutocompleteTrie;


