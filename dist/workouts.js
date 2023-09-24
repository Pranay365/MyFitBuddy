"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serverless_http_1 = __importDefault(require("serverless-http"));
const router = (0, express_1.Router)();
router.get("/pello", (req, res) => {
    res.send("pello");
});
module.exports.handler = (0, serverless_http_1.default)(app);
