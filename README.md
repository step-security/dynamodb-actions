# StepSecurity maintained dynamodb-actions action

GitHub action that integrates with Amazon DynamoDB.

Inspired from [DynamoDB integration in AWS Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/connect-ddb.html)

## Supported Operations

### Get Item

Get Item from DynamoDB and Returns JSON-serialized Item payload.

##### Example

```yaml
# ...
jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Get DynamoDB Item
        id: config
        uses: step-security/dynamodb-actions@v1
        env:
          AWS_DEFAULT_REGION: us-east-1
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        with:
          operation: get
          region: us-east-1
          table: my-awesome-config
          key: |
            { key: "foo" }
      - name: Print item
        run: |
          echo '${{ steps.config.outputs.item }}'
      - name: Print specific field using built-in function
        run: |
          echo '${{ fromJson(steps.config.outputs.item).commit }}'
      - name: Print specific field using jq
        run: |
          jq '.commit' <<< '${{ steps.config.outputs.item }}'
```


##### Input

```typescript
type GetItemInput = {
  operation: "get";
  region: string;
  table: string;
  key: string; // JSON-serialized key
  consistent?: boolean;
}
```

##### Output

JSON-serialized item will be set to `item` output.

### Put Item

Put Item to DynamoDB

##### Example

with JSON input:

```yaml
# ...
jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Put DynamoDB Item
        uses: step-security/dynamodb-actions@v1
        env:
          AWS_DEFAULT_REGION: us-east-1
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        with:
          operation: put
          region: us-east-1
          table: my-awesome-config
          item: |
            { 
              key: "foo",
              value: "wow",
              awesome: true,
              stars: 12345
            }
```

with File input:


```yaml
# ...
jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Put DynamoDB Item
        uses: step-security/dynamodb-actions@v1
        env:
          AWS_DEFAULT_REGION: us-east-1
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        with:
          operation: put
          region: us-east-1
          table: my-awesome-config
          file: somewhere/filename.json
```


##### Input

```typescript
type PutItemInput = {
  operation: "put";
  region: string;
  table: string;
  item: string; // JSON-serialized item
} | {
  operation: "put";
  region: string;
  table: string;
  file: string; // JSON file path
};
```

##### Output

None.


### Batch Put Item

Batch Put Item to DynamoDB.

##### Example

with JSON input:

```yaml
# ...
jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Put DynamoDB Item
        uses: step-security/dynamodb-actions@v1
        env:
          AWS_DEFAULT_REGION: us-east-1
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        with:
          operation: batch-put
          region: us-east-1
          table: my-awesome-config
          items: |
            [{ 
              key: "foo",
              value: "wow",
              awesome: true,
              stars: 12345
            }, {
              key: "bar",
              value: "such",
              awesome: false,
              stars: 1
            }]
```

with File input (Glob):

> You can select multiple files by supplying Glob.
>
> For supported Glob patterns, Please refer to [@actions/glob README](https://github.com/actions/toolkit/tree/master/packages/glob#patterns).
  

```yaml
# ...
jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Put DynamoDB Item
        uses: step-security/dynamodb-actions@v1
        env:
          AWS_DEFAULT_REGION: us-east-1
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        with:
          operation: batch-put
          region: us-east-1
          table: my-awesome-config
          files: somewhere/prefix*.json
```


##### Input

```typescript
type BatchPutItemInput = {
  operation: "batch-put";
  region: string;
  table: string;
  items: string; // JSON-serialized item array
} | {
  operation: "put";
  region: string;
  table: string;
  files: string; // Glob to match JSON file paths
};
```

##### Output

None.


### Delete Item

Delete Item from DynamoDB

##### Example

```yaml
# ...
jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Delete DynamoDB Item
        uses: step-security/dynamodb-actions@v1
        env:
          AWS_DEFAULT_REGION: us-east-1
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        with:
          operation: delete
          region: us-east-1
          table: my-awesome-config
          key: |
            { key: "foo" }
```

##### Input

```typescript
type DeleteItemInput = {
  operation: "delete";
  region: string;
  table: string;
  key: string; // JSON-serialized key
}
```

##### Output

None

## Using this action with OIDC

You can securely configure AWS credentials using GitHub’s OpenID Connect (OIDC) provider, eliminating the need to store long-lived credentials as secrets. By configuring your AWS IAM role trust policy to trust GitHub’s OIDC provider, you can assume this role directly within your workflow.

### Prerequisites

1. **AWS IAM Role with OIDC Trust**:  
   Create or modify an IAM role that trusts the GitHub OIDC provider. For example:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::<your_account_id>:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
             "token.actions.githubusercontent.com:sub": "repo:<your_org>/<your_repo>:ref:refs/heads/main"
           }
         }
       }
     ]
   }
   ```
2. **GitHub Secrets**:
    Store the IAM role’s ARN in a GitHub secret, for example ROLE_TO_ASSUME.

### Example OIDC Workflow
This example shows how to assume an AWS IAM role using OIDC before running the DynamoDB action.

```yaml
name: Example OIDC Workflow
on:
  push:
    branches: [ main ]

jobs:
  job:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      # Check out repository
      - uses: actions/checkout@v1
      
      # Configure AWS credentials via OIDC
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.ROLE_TO_ASSUME }}
          aws-region: us-east-1  # Update as needed

      # Get an item from DynamoDB using assumed credentials
      - name: Get DynamoDB Item
        id: config
        uses: step-security/dynamodb-actions@v1
        with:
          operation: get
          region: us-east-1
          table: my-awesome-config
          key: |
            { key: "foo" }

      # Print the full item
      - name: Print item
        run: |
          echo '${{ steps.config.outputs.item }}'

      # Print a specific field using built-in function
      - name: Print specific field using built-in function
        run: |
          echo '${{ fromJson(steps.config.outputs.item).commit }}'

      # Print a specific field using jq
      - name: Print specific field using jq
        run: |
          jq '.commit' <<< '${{ steps.config.outputs.item }}'
```
#### Note:
- Ensure that the role-to-assume ARN matches the one in your AWS IAM configuration.
- Update the aws-region and the table name as per your requirements.


## FAQ

#### How to select specific field?

Use Github Actions built-in `fromJson` function.

For example:
```yaml
- name: Print specific field
  run: |
    echo '${{ fromJson(steps.[id].outputs.item).[field] }}'
```

Alternatively, You can also use [jq](https://stedolan.github.io/jq/). [Github-hosted runners already have pre-installed jq.](https://help.github.com/en/actions/reference/software-installed-on-github-hosted-runners)

For example:
```yaml
- name: Print specific field
  run: |
    jq '.field' <<< echo '${{ steps.[id].outputs.item }}'
``` 

## Wishlist

- Add UpdateItem operation
- Add conditional writes (e.g. putItem / updateItem)

