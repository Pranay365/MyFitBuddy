"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfilePic = exports.userSettings = exports.user = void 0;
const config_1 = require("./config");
const util_1 = require("./util");
const path_1 = __importDefault(require("path"));
function user(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userObj = req.user;
        const username = userObj.email.split("@")[0];
        const userHealthStats = yield (0, util_1.getHealthStats)(username);
        delete userObj.hashedPassword;
        userObj.role = "authenticated";
        userObj.health = userHealthStats;
        return res.status(200).json(userObj);
    });
}
exports.user = user;
;
function userSettings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userObj = req.user;
        const username = userObj.email.split("@")[0];
        const { heartbeat, maintenance_cal, sleep } = req.body;
        const settings = yield (0, util_1.saveSettings)(username, heartbeat, maintenance_cal, sleep);
        return res.status(201).json(settings);
    });
}
exports.userSettings = userSettings;
function getUserProfilePic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const profile = yield (0, util_1.getUserProfile)(req.params.name);
        res.setHeader("content-type", "image/jpg");
        if (profile) {
            res.send(profile);
        }
        else {
            const defaultFile = yield (0, util_1.readFilePromise)(path_1.default.join(config_1.srcDir, "default-user.jpg"));
            res.send(defaultFile);
        }
    });
}
exports.getUserProfilePic = getUserProfilePic;
;
