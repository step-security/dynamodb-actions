"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchPutOperation = void 0;
const glob = __importStar(require("@actions/glob"));
const Joi = __importStar(require("@hapi/joi"));
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const fs_1 = require("fs");
const helpers_1 = require("../helpers");
const BaseInputSchema = Joi.object({
    operation: Joi.string().lowercase().valid("batch-put").required(),
    region: Joi.string().lowercase().required(),
    table: Joi.string().required(),
});
const InputSchema = Joi.alternatives([
    BaseInputSchema.append({
        items: Joi.array().items(Joi.object().required()).min(1).required(),
    }),
    BaseInputSchema.append({
        files: Joi.string().required(),
    }),
]).required();
class BatchPutOperation {
    constructor() {
        this.name = "batch-put";
    }
    async validate(input) {
        const validationResult = InputSchema.validate(input, {
            stripUnknown: true,
        });
        if (validationResult.error) {
            throw validationResult.error;
        }
        return validationResult.value;
    }
    async execute(input) {
        var _a, _b;
        const ddb = (0, helpers_1.createClient)(input.region);
        const items = input.items || await this.read(input.files);
        const chunks = this.chunk(items, 20);
        for (const chunk of chunks) {
            const res = await ddb.send(new lib_dynamodb_1.BatchWriteCommand({
                RequestItems: {
                    [input.table]: chunk.map((item) => ({
                        PutRequest: {
                            Item: item,
                        },
                    })),
                },
            }));
            const failedItems = (_b = (_a = res.UnprocessedItems) === null || _a === void 0 ? void 0 : _a[input.table]) !== null && _b !== void 0 ? _b : [];
            if (failedItems.length > 0) {
                console.error("UnprocessedItems: ", res.UnprocessedItems); // tslint:disable-line
                throw new Error("Got UnprocessedItems from DynamoDB");
            }
        }
    }
    async read(globs) {
        const globber = await glob.create(globs);
        const files = await globber.glob();
        if (files.length === 0) {
            throw new Error("Given glob does not match any files");
        }
        return Promise.all(files.map(async (file) => {
            const content = await fs_1.promises.readFile(file, { encoding: "utf8" });
            return JSON.parse(content);
        }));
    }
    chunk(items, size) {
        return items.reduce((collection, item) => {
            const lastChunk = collection[collection.length - 1];
            if (lastChunk.length < 20) {
                lastChunk.push(item);
            }
            else {
                collection.push([item]);
            }
            return collection;
        }, [[]]);
    }
}
exports.BatchPutOperation = BatchPutOperation;
