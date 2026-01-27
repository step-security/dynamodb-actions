import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import * as vm from "vm";

export function createClient(endpoint: string): DynamoDBDocumentClient {
  const client = /^https?/i.test(endpoint) ?
    new DynamoDBClient({ endpoint, region: "us-east-1" }) :
    new DynamoDBClient({ region: endpoint });
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true }
  });
}

export function forgivingJSONParse(input: string): any {
  try {
    // forgiving JSON parse
    const sandbox = { parsed: null };

    return vm.runInNewContext(`parsed = ${input}`, sandbox, { displayErrors: false });
  } catch (e) { /* no-op */ }
}
