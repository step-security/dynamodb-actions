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
exports.PutOperation = void 0;
const Joi = __importStar(require("@hapi/joi"));
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const fs_1 = require("fs");
const helpers_1 = require("../helpers");
const BaseInputSchema = Joi.object({
    operation: Joi.string().lowercase().valid("put").required(),
    region: Joi.string().lowercase().required(),
    table: Joi.string().required(),
});
const InputSchema = Joi.alternatives([
    BaseInputSchema.append({
        item: Joi.object().required(),
    }),
    BaseInputSchema.append({
        file: Joi.string().required(),
    }),
]).required();
class PutOperation {
    constructor() {
        this.name = "put";
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
        const ddb = (0, helpers_1.createClient)(input.region);
        const item = input.item || await this.read(input.file);
        await ddb.send(new lib_dynamodb_1.PutCommand({
            TableName: input.table,
            Item: item,
        }));
    }
    async read(path) {
        const content = await fs_1.promises.readFile(path, { encoding: "utf8" });
        return JSON.parse(content);
    }
}
exports.PutOperation = PutOperation;
