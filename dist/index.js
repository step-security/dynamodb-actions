"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const core = require("@actions/core");
const helpers_1 = require("./helpers");
const processor_1 = require("./processor");
const processor = new processor_1.Processor();
async function validateSubscription() {
    const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`;
    try {
        await axios_1.default.get(API_URL, { timeout: 3000 });
    }
    catch (error) {
        if ((0, axios_1.isAxiosError)(error) && error.response) {
            core.error('Subscription is not valid. Reach out to support@stepsecurity.io');
            process.exit(1);
        }
        else {
            core.info('Timeout or API not reachable. Continuing to next step.');
        }
    }
}
(async () => {
    var _a;
    await validateSubscription();
    const input = {
        // Common
        operation: (_a = core.getInput("operation")) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
        region: core.getInput("region"),
        table: core.getInput("table"),
        // Get / Delete Operation
        key: (0, helpers_1.forgivingJSONParse)(core.getInput("key")),
        consistent: (0, helpers_1.forgivingJSONParse)(core.getInput("consistent")),
        // Put Operation
        item: (0, helpers_1.forgivingJSONParse)(core.getInput("item")),
        file: core.getInput("file"),
        // BatchPut Operation
        items: (0, helpers_1.forgivingJSONParse)(core.getInput("items")),
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
