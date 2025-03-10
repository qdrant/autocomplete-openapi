"use strict";

/**
 * Generate request header:
 * this function takes OpenAPI definition of a method
 * and generates a request header with placeholders.
 *
 * Returns generated header and number of the next placeholder.
 *
 * Example output:
 * ["PUT /collections/${1:collection_name}/shards", 2]
 *
 * Example input:
 * {
 *   "method": "put",
 *   "path": "/collections/{collection_name}/shards",
 *   "body": "#/components/schemas/CreateShardingKey",
 *   "operationId": "create_shard_key",
 *   "tags": [
 *     "Distributed"
 *   ],
 *   "parameters": [
 *     {
 *       "name": "collection_name",
 *       "in": "path",
 *       "description": "Name of the collection to create shards for",
 *       "required": true,
 *       "schema": {
 *         "type": "string"
 *       }
 *     },
 *     {
 *       "name": "timeout",
 *       "in": "query",
 *       "description": "Wait for operation commit timeout in seconds. \nIf timeout is reached - request will return with service error.\n",
 *       "schema": {
 *         "type": "integer"
 *       }
 *     }
 *   ],
 *   "summary": "Create shard key"
 * }
 */
export const generateRequestHeader = (method) => {
  let nextPlaceholderId = 1;
  let insertText = `${method.method.toUpperCase()} `;
  let methodPath = method.path;

  const parameters = method.parameters;
  if (parameters) {
    for (let param of parameters) {
      if (param.in === "path" && param.required) {
        const regex = new RegExp(`\\{${param.name}\\}`, "g");
        methodPath = methodPath.replace(
          regex,
          `\${${nextPlaceholderId}:${param.name}}`
        );
        nextPlaceholderId++;
      }
    }
  }
  insertText += methodPath;

  return [insertText, nextPlaceholderId];
};

/**
 * Generate response header:
 * this function takes OpenAPI definition of a method
 * and generates a response body with placeholders.
 *
 * Example output:
 * {
 *  "shard_key": ${2:shared_key}
 * }
 *
 * Example input:
 * {
 *   type: 'object',
 *   required: [ 'shard_key' ],
 *   properties: {
 *     shard_key: { '$ref': '#/components/schemas/ShardKey' },
 *     shards_number: {
 *       description: 'How many shards to create for this key If not specified, will use the default value from config',
 *       type: 'integer',
 *       format: 'uint32',
 *       minimum: 1,
 *       nullable: true
 *     },
 *     replication_factor: {
 *       description: 'How many replicas to create for each shard If not specified, will use the default value from config',
 *       type: 'integer',
 *       format: 'uint32',
 *       minimum: 1,
 *       nullable: true
 *     },
 *     placement: {
 *       description: 'Placement of shards for this key List of peer ids, that can be used to place shards for this key If not specified, will be randomly placed among all peers',
 *       type: 'array',
 *       items: [Object],
 *       nullable: true
 *     }
 *   }
 * }
 */
export const generateResponseBody = (body, placeholderOffset) => {
  let insertText = "";
  if (body.required && body.required.length > 0) {
    insertText += "{";
    for (let i = 0; i < body.required.length; i++) {
      const key = body.required[i];
      insertText += `\n  "${key}": $${placeholderOffset}`;
      placeholderOffset++;
      if (i < body.required.length - 1) {
        insertText += ",";
      }
    }
    insertText += "\n}";
  } else {
    insertText += `{\n  $${placeholderOffset}\n}`;
  }

  return insertText;
};
