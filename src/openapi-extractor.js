export class OpenAPIMethod {
  constructor(method, path, body, operationId, tags, parameters,summary) {
    this.method = method;
    this.path = path;
    this.body = body; // definition of the body
    this.operationId = operationId;
    this.tags = tags;
    this.parameters = parameters;
    this.summary = summary;
  }
}

export class OpenAPIExtractor {
  constructor(openapi) {
    this.openapi = openapi;
  }

  getAllMethods() {
    let methods = [];

    for (let path in this.openapi.paths) {
      for (let method in this.openapi.paths[path]) {
        methods.push(
          new OpenAPIMethod(
            method,
            path,
            this.openapi.paths[path][method]?.requestBody?.content?.[
              "application/json"
            ]?.schema?.["$ref"],
            this.openapi.paths[path][method].operationId,
            this.openapi.paths[path][method].tags,
            this.openapi.paths[path][method]?.parameters,
            this.openapi.paths[path][method].summary
          )
        );
      }
    }

    return methods;
  }

  objectByRef(ref) {
    let path = ref.split("/");
    path.shift();

    let current = this.openapi;
    for (let pathToken of path) {
      current = current[pathToken];
    }

    return current;
  }

  _objectsByPath(starObj, path) {
    let current = starObj;

    // Check that the current is an js type object
    if (typeof current !== "object" || current === null) {
      return [];
    }

    // Check if `$ref`
    if (current?.["$ref"]) {
      return this._objectsByPath(this.objectByRef(current["$ref"]), path);
    }

    // Check if object is anyOf or oneOf
    if (current?.["anyOf"]) {
      let result = [];
      for (let option of current["anyOf"]) {
        if (option?.["$ref"]) {
          result.push(
            ...this._objectsByPath(this.objectByRef(option["$ref"]), path)
          );
        }
        if (option?.["type"] === "object" || option?.["type"] === "array") {
          result.push(...this._objectsByPath(option, path));
        }
      }
      return result;
    }

    if (current?.["oneOf"]) {
      let result = [];
      for (let option of current["oneOf"]) {
        if (option?.["$ref"]) {
          result.push(
            ...this._objectsByPath(this.objectByRef(option["$ref"]), path)
          );
        }
        if (option?.["type"] === "object") {
          result.push(...this._objectsByPath(option, path));
        }
      }
      return result;
    }

    if (path === null) {
      return [];
    }

    if (path.length == 0) {
      return [current];
    }

    let firstPathElement = path[0];

    let restOfPath = path.slice(1);

    if (
      typeof firstPathElement === "number" ||
      firstPathElement instanceof Number
    ) {
      // Expect that the current is an array
      if (current?.type != "array") {
        return [];
      }

      if (!current?.items) {
        return [];
      }

      return this._objectsByPath(current.items, restOfPath);
    }

    if (
      typeof firstPathElement === "string" ||
      firstPathElement instanceof String
    ) {
      // Expect that the current is an object
      if (current?.type != "object") {
        return [];
      }

      // Check for `additionalProperties`, which should match with any string
      if (current?.additionalProperties) {
        let additionalProperties = current.additionalProperties;
        return this._objectsByPath(additionalProperties, restOfPath);
      }

      if (!current?.properties) {
        return [];
      }

      if (!current?.properties[firstPathElement]) {
        return [];
      }

      let selectedProperty = current.properties[firstPathElement];

      return this._objectsByPath(selectedProperty, restOfPath);
    }

    return [];
  }

  objectsByPath(startRef, path) {
    let current = this.objectByRef(startRef);

    return this._objectsByPath(current, path);
  }

  allProperties(startRef, path, prefix) {
    let objects = this.objectsByPath(startRef, path);

    let properties = [];

    for (let object of objects) {
      if (object?.properties) {
        for (let propertyName in object.properties) {
          if (propertyName.startsWith(prefix)) {
            properties.push(propertyName);
          }
        }
      }
    }
    return properties;
  }

  // auto complete enum values
  allEnumValues(startRef, path, prefix, value) {
    const objects = this.objectsByPath(startRef, path);
    const enumValues = [];

    function readEnums(objects, value) {
      const enumValues = [];
      objects.forEach((object) => {
        if (object?.enum) {
          enumValues.push(
            ...object.enum.filter((enumValue) => enumValue.startsWith(value))
          );
        }
      });
      return enumValues;
    }

    objects.forEach((object) => {
      if (object?.properties) {
        Object.entries(object.properties).forEach(
          ([propertyName, property]) => {
            if (propertyName === prefix) {
              const enumValuesRef = readEnums([property], value);
              enumValues.push(...enumValuesRef);

              if (property?.$ref) {
                const enumValuesRef = readEnums(
                  this.objectsByPath(property.$ref, []),
                  value
                );
                enumValues.push(...enumValuesRef);
              }

              if (property?.anyOf) {
                property.anyOf.forEach((anyOf) => {
                  if (anyOf?.$ref) {
                    const enumValuesRef = readEnums(
                      this.objectsByPath(anyOf.$ref, []),
                      value
                    );
                    enumValues.push(...enumValuesRef);
                  }
                  if (anyOf?.enum) {
                    enumValues.push(
                      ...anyOf.enum.filter((enumValue) =>
                        enumValue.startsWith(value)
                      )
                    );
                  }
                });
              }
            }
          }
        );
      }
    });
    return enumValues;
  }
}
