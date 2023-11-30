import axios, {isAxiosError} from 'axios'
import * as core from "@actions/core";

import { forgivingJSONParse } from "./helpers";
import { Processor } from "./processor";

const processor = new Processor();

async function validateSubscription(): Promise<void> {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`

  try {
    await axios.get(API_URL, {timeout: 3000})
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      core.error(
        'Subscription is not valid. Reach out to support@stepsecurity.io'
      )
      process.exit(1)
    } else {
      core.info('Timeout or API not reachable. Continuing to next step.')
    }
  }
}

(async () => {

  await validateSubscription()

  const input = {
    // Common
    operation: core.getInput("operation")?.toLowerCase(),
    region: core.getInput("region"),
    table: core.getInput("table"),

    // Get / Delete Operation
    key: forgivingJSONParse(core.getInput("key")),
    consistent: forgivingJSONParse(core.getInput("consistent")),

    // Put Operation
    item: forgivingJSONParse(core.getInput("item")),
    file: core.getInput("file"),

    // BatchPut Operation
    items: forgivingJSONParse(core.getInput("items")),
    files: core.getInput("files"),
  };

  const output = await processor.process(input);
  if (output) {
    for (const [key, value] of Object.entries(output)) {
      core.setOutput(key, value);
    }
  }
})().catch((e) => {
  console.error(e.stack); // tslint:disable-line
  core.setFailed(e.message);
});
