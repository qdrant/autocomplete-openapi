
const trancingValue = "f54f2be8-1df6-4427-9269-59fa39167783";


function tokenize(input) {
  var current = 0;
  var tokens = [];

  while (current < input.length) {
    var char = input[current];

    if (char === '\\') {
      current++;
      continue;
    }

    if (char === '{') {
      tokens.push({
        type: 'brace',
        value: '{'
      });

      current++;
      continue;
    }

    if (char === '}') {
      tokens.push({
        type: 'brace',
        value: '}'
      });

      current++;
      continue;
    }

    if (char === '[') {
      tokens.push({
        type: 'paren',
        value: '['
      });

      current++;
      continue;
    }

    if (char === ']') {
      tokens.push({
        type: 'paren',
        value: ']'
      });

      current++;
      continue;
    }

    if (char === ':') {
      tokens.push({
        type: 'separator',
        value: ':'
      });

      current++;
      continue;
    }

    if (char === ',') {
      tokens.push({
        type: 'delimiter',
        value: ','
      });

      current++;
      continue;
    }

    if (char === '"') {
      var value = '';
      var danglingQuote = false;

      char = input[++current];

      while (char !== '"') {
        if (current === input.length) {
          danglingQuote = true;
          break;
        }

        if (char === '\\') {
          current++;
          if (current === input.length) {
            danglingQuote = true;
            break;
          }
          value += char + input[current];
          char = input[++current];
        } else {
          value += char;
          char = input[++current];
        }
      }

      char = input[++current];

      if (!danglingQuote) {
        tokens.push({
          type: 'string',
          value: value
        });
      } else {
        tokens.push({
          type: 'unclosed-string',
          value: value
        });
      }
      continue;
    }

    var WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    var NUMBERS = /[0-9]/;
    if (NUMBERS.test(char) || char === '-' || char === '.') {
      var _value = '';

      if (char === '-') {
        _value += char;
        char = input[++current];
      }

      while (NUMBERS.test(char) || char === '.') {
        _value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'number',
        value: _value
      });
      continue;
    }

    var LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      var _value2 = '';

      while (LETTERS.test(char)) {
        if (current === input.length) {
          break;
        }
        _value2 += char;
        char = input[++current];
      }

      if (_value2 == 'true' || _value2 == 'false') {
        tokens.push({
          type: 'name',
          value: _value2
        });
      } else {
        throw new Error('Invalid token:', _value2 + ' is not a valid token!');
      }
      continue;
    }

    current++;
  }

  return tokens;
}

function strip(tokens) {
  if (tokens.length === 0) {
    return tokens;
  }

  var lastToken = tokens[tokens.length - 1];

  switch (lastToken.type) {
    case 'separator':
      tokens = tokens.slice(0, tokens.length - 1);
      return strip(tokens);
      break;
    case 'number':
      var lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
      if (lastCharacterOfLastToken === '.' || lastCharacterOfLastToken === '-') {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      }
    case 'string':
      var tokenBeforeTheLastToken = tokens[tokens.length - 2];
      if (tokenBeforeTheLastToken.type === 'delimiter') {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      } else if (tokenBeforeTheLastToken.type === 'brace' && tokenBeforeTheLastToken.value === '{') {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      }
      break;
    case 'unclosed-string':
      tokens = tokens.slice(0, tokens.length - 1);
      return strip(tokens);
      break;
    case 'delimiter':
      tokens = tokens.slice(0, tokens.length - 1);
      return strip(tokens);
      break;
  }

  return tokens;
}

function unstrip(tokens) {
  var tail = [];

  tokens.map(function (token) {
    if (token.type === 'brace') {
      if (token.value === '{') {
        tail.push('}');
      } else {
        tail.splice(tail.lastIndexOf('}'), 1);
      }
    }
    if (token.type === 'paren') {
      if (token.value === '[') {
        tail.push(']');
      } else {
        tail.splice(tail.lastIndexOf(']'), 1);
      }
    }
  });

  if (tail.length > 0) {
    // If last tokens is an open brace or paren, we add delimiter
    let lastToken = tokens[tokens.length - 1];
    let skipDelimiter = false;
    if (lastToken.value === '{' || lastToken.value === '[') {
      skipDelimiter = true;
    }

    tail.reverse().map(function (item) {
      if (item === '}') {
        if (!skipDelimiter) {
          tokens.push({
            type: 'delimiter',
            value: ','
          });
        }
        tokens.push(...[{
          type: 'string',
          value: trancingValue,
        },
        {
          type: 'separator',
          value: ':'
        },
        {
          type: 'string',
          value: "",
        },
        {
          type: 'brace',
          value: '}'
        }
        ]);
      } else if (item === ']') {
        if (!skipDelimiter) {
          tokens.push({
            type: 'delimiter',
            value: ','
          });
        }

        tokens.push(...[
          {
            type: 'string',
            value: trancingValue,
          },
          {
            type: 'paren',
            value: ']'
          }
        ]);
      }
      skipDelimiter = false;
    });
  }

  return tokens;
}

function generate(tokens) {
  var output = '';

  tokens.map(function (token) {
    switch (token.type) {
      case 'string':
        output += '"' + token.value + '"';
        break;
      case 'unclosed-string':
        output += '"' + token.value;
        break;
      default:
        output += token.value;
        break;
    }
  });

  return output;
}

function partialParse(input) {

  let tokens = tokenize(input);

  let tokensLength = tokens.length;

  let stripped = strip(tokens);

  let strippedLength = tokensLength - stripped.length;

  let strippedTail = strippedLength > 0 ? tokens.slice(-strippedLength) : [];

  let unstripped = unstrip(stripped);

  let generated = generate(unstripped);

  let generatedStrippedTail = generate(strippedTail);

  return [
    JSON.parse(generated),
    generatedStrippedTail,
  ];
}

class ParseResult {
  constructor(data, path, editedChunk) {
    this.data = data; // Parsed json as much as possible
    this.path = path; // Path in the json object where we have a cursor position
    this.editedChunk = editedChunk; // Currently edited chunk
  }


  /// Parse the edited chunk and return the result
  /// Example:
  /// '' -> {"key": null, "value": null, editing: null}
  /// ', ' -> {"key": null, "value": null, editing: null}
  /// ', "a ' -> {"key": "", "value": null, editing: "key"}
  /// ', "a": ' -> {"key": "a", "value": null, editing: null}
  /// ', "a": "a' -> {"key": "a", "value": a, editing: "value"}
  getEditedChunk() {

    let editing = null;
    let value = null;
    let key = null;

    // Remove staring comma
    let editedChunk = this.editedChunk;
    if (editedChunk.startsWith(",")) {
      editedChunk = editedChunk.slice(1).trim();
    }

    if (editedChunk === "") {
      return {
        key: null,
        value: null,
        editing: null,
      };
    }

    // Try to split the edited chunk by ":"
    let split = editedChunk.split(":");

    // If there is no ":" in the edited chunk, we are editing the key
    if (split.length === 1) {

      key = split[0].trim();

      if (key.startsWith('"')) {
        key = key.slice(1);
      }

      if (key.endsWith('"')) {
        key = key.slice(0, -1);
      } else {
        editing = "key";
      }
    }

    if (split.length !== 2) {
      // This is unexpected, probably some value in the json is usign ":" character,
      // better skip the completion
      return {
        key: key,
        value: value,
        editing: editing,
      };
    }

    key = split[0].trim();

    if (key.startsWith('"')) {
      key = key.slice(1);
    }

    if (key.endsWith('"')) {
      key = key.slice(0, -1);
    }

    value = split[1].trim();

    if (value !== "") {

      if (value.startsWith('"')) {
        value = value.slice(1);
      }

      if (value.endsWith('"')) {
        value = value.slice(0, -1);
      } else {
        editing = "value";
      }
    } else {
      value = null;
    }

    return {
      key: key,
      value: value,
      editing: editing,
    };
  }
}


/// Recusively goes over the json object:
/// follows the path if an object has `trancingValue` key or if an array has `trancingValue` element
function extractPath(data) {
  if (data instanceof Array) {
    let length = data.length;
    if (length === 0) {
      return null;
    }

    let lastElement = data[length - 1];
    if (lastElement !== trancingValue) {
      return null;
    }

    data.pop();

    if (length === 1) {
      return [];
    }

    // Check the last element of the actual array
    let path = extractPath(data[length - 2]);
    if (path !== null) {
      return [length - 2, ...path];
    }
    return [];
  }

  if (data instanceof Object) {
    /// Check if the object has `trancingValue` key
    if (!data.hasOwnProperty(trancingValue)) {
      return [];
    }

    delete data[trancingValue];

    // Iterate over all keys and try to find the path
    let keys = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let path = extractPath(data[key]);
      if (path !== null) {
        return [key, ...path];
      }
    }
    return [];
  }

  return null;
}


/// returns `ParseResult`
function partialParseJson(jsonString) {

  let partialJson = [{}, "", ""];
  try {
    partialJson = partialParse(jsonString);
  } catch (e) {
    return new ParseResult(null, null, null);
  }

  let path = extractPath(partialJson[0]);

  return new ParseResult(partialJson[0], path, partialJson[1]);
}


exports.partialParseJson = partialParseJson;
