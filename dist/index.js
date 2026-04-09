"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const core = require("@actions/core");
const fs = require("fs");
const helpers_1 = require("./helpers");
const processor_1 = require("./processor");
const processor = new processor_1.Processor();
async function validateSubscription() {
    var _a, _b;
    const eventPath = process.env.GITHUB_EVENT_PATH;
    let repoPrivate;
    if (eventPath && fs.existsSync(eventPath)) {
        const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
        repoPrivate = (_a = eventData === null || eventData === void 0 ? void 0 : eventData.repository) === null || _a === void 0 ? void 0 : _a.private;
    }
    const upstream = 'mooyoul/dynamodb-actions';
    const action = process.env.GITHUB_ACTION_REPOSITORY;
    const docsUrl = 'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions';
    core.info('');
    core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m');
    core.info(`Secure drop-in replacement for ${upstream}`);
    if (repoPrivate === false)
        core.info('\u001b[32m\u2713 Free for public repositories\u001b[0m');
    core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
    core.info('');
    if (repoPrivate === false)
        return;
    const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
    const body = { action: action || '' };
    if (serverUrl !== 'https://github.com')
        body.ghes_server = serverUrl;
    try {
        await axios_1.default.post(`https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`, body, { timeout: 3000 });
    }
    catch (error) {
        if ((0, axios_1.isAxiosError)(error) && ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
            core.error(`\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`);
            core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
            process.exit(1);
        }
        core.info('Timeout or API not reachable. Continuing to next step.');
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
    console.error(e.stack); // eslint-disable-line no-console
    core.setFailed(e.message);
});
