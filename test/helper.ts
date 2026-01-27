import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, waitUntilTableExists, waitUntilTableNotExists } from "@aws-sdk/client-dynamodb";

export const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || "http://127.0.0.1:8000";

export function toJS<R, E = Error>(promise: Promise<R>): Promise<[null, R] | [E, null]> {
  return promise.then((v) => [null, v] as [null, R])
    .catch((e) => [e, null] as [E, null]);
}

export const ddb = new DynamoDBClient({
  endpoint: DYNAMODB_ENDPOINT,
  region: "us-east-1",
});

export const tableName = "dynamodb-actions-test";

beforeEach(async () => {
  await ddb.send(new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{
      AttributeName: "key",
      KeyType: "HASH",
    }],
    AttributeDefinitions: [{
      AttributeName: "key",
      AttributeType: "S",
    }],
    BillingMode: "PAY_PER_REQUEST",
  }));

  await waitUntilTableExists({ client: ddb, maxWaitTime: 30 }, { TableName: tableName });
});

afterEach(async () => {
  await ddb.send(new DeleteTableCommand({ TableName: tableName }));

  await waitUntilTableNotExists({ client: ddb, maxWaitTime: 30 }, { TableName: tableName });
});
