"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgivingJSONParse = exports.createClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const vm = require("vm");
function createClient(endpoint) {
    const client = /^https?/i.test(endpoint) ?
        new client_dynamodb_1.DynamoDBClient({ endpoint, region: "us-east-1" }) :
        new client_dynamodb_1.DynamoDBClient({ region: endpoint });
    return lib_dynamodb_1.DynamoDBDocumentClient.from(client);
}
exports.createClient = createClient;
function forgivingJSONParse(input) {
    try {
        // forgiving JSON parse
        const sandbox = { parsed: null };
        return vm.runInNewContext(`parsed = ${input}`, sandbox, { displayErrors: false });
    }
    catch (e) { /* no-op */ }
}
exports.forgivingJSONParse = forgivingJSONParse;
