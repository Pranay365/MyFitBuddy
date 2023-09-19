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
exports.login = exports.signup = exports.logout = exports.isAuthenticated = void 0;
const sharp_1 = __importDefault(require("sharp"));
const store_1 = __importDefault(require("./store"));
const util_1 = require("./util");
const util_2 = require("./util");
const constants_1 = require("./constants");
const yup_1 = require("yup");
const bcryptjs_1 = require("bcryptjs");
function isAuthenticated(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let reqCookie = (0, util_2.getCookies)(req);
            console.log("reqCookie in isAuthenticated", reqCookie);
            const resCookie = yield store_1.default.get(reqCookie.registrationId);
            if (resCookie) {
                const userObj = yield (0, util_1.getUserfromDB)(resCookie === null || resCookie === void 0 ? void 0 : resCookie.username);
                if (userObj) {
                    req.user = userObj;
                    req.registrationId = resCookie.value;
                    res.setHeader("Set-cookie", `registrationId=${userObj.registrationId};Max-Age=${24 * 60 * 60};path=/;sameSite=none;secure=true;HttpOnly=true`);
                    return next();
                }
            }
            else {
                return res.status(403).json("Unauthorized access");
            }
        }
        catch (ex) {
            console.log(ex);
        }
    });
}
exports.isAuthenticated = isAuthenticated;
;
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userObj = req.user;
        try {
            yield store_1.default.remove(userObj.registrationId);
            res.removeHeader("Set-Cookie");
            res.setHeader("Set-Cookie", "registrationId=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/");
            return res.status(200).json("Logged out successfully");
        }
        catch (ex) {
            return res.status(400).json("Unable to logout");
        }
    });
}
exports.logout = logout;
function signup(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const avatar = req.file && (yield (0, sharp_1.default)((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer)
                .resize({ height: 100, width: 100 })
                .png()
                .toBuffer());
            const { email, password, confirmPassword, first_name, last_name } = req.body;
            console.log(req.body);
            console.log(email, password, confirmPassword, avatar);
            const username = email === null || email === void 0 ? void 0 : email.split("@")[0];
            const registrationId = yield (0, util_1.register)(username, password, confirmPassword, email, first_name, last_name, avatar);
            if (registrationId) {
                return res.status(200).json({
                    status: constants_1.MESSAGE.MESSAGE_REGISTRATION_SUCESS,
                    body: JSON.stringify({ registrationId }),
                });
            }
            else {
                return res.status(400).json({
                    status: constants_1.MESSAGE.MESSAGE_REGISTRATION_FAIL,
                    body: JSON.stringify({ message: constants_1.MESSAGE.MESSAGE_REGISTRATION_FAIL }),
                });
            }
        }
        catch (ex) {
            if (ex instanceof yup_1.ValidationError) {
                console.log(JSON.stringify(ex, null, 2));
                return res.status(400).json(constants_1.MESSAGE.MESSAGE_INVALID_USER);
            }
            return res.status(500).json(constants_1.MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
        }
    });
}
exports.signup = signup;
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let reqCookie = (0, util_2.getCookies)(req);
            console.log("cookies is ", reqCookie);
            const resCookie = yield store_1.default.get(reqCookie.registrationId);
            if (resCookie) {
                console.log(resCookie);
                const userObj = yield (0, util_1.getUserfromDB)(resCookie.username);
                const userHealthStats = yield (0, util_2.getHealthStats)(resCookie.username);
                res.setHeader("Set-cookie", `registrationId=${resCookie.value};Max-Age=${24 * 60 * 60};path=/;samesite=None;secure=true;HttpOnly=true`);
                delete userObj.hashedPassword;
                userObj.role = "authenticated";
                userObj.heath = userHealthStats;
                return res.status(200).json(userObj);
            }
            const { email: username, password } = req.body;
            const userObj = yield (0, util_1.getUserfromDB)(username === null || username === void 0 ? void 0 : username.split("@")[0]);
            console.log(userObj);
            if (userObj) {
                const isAuthenticated = yield (0, bcryptjs_1.compare)(password, userObj === null || userObj === void 0 ? void 0 : userObj.hashedPassword);
                if (isAuthenticated) {
                    //req.session.registrationId = registrationId;
                    res.setHeader("Set-cookie", `registrationId=${userObj.registrationId};Max-Age=${24 * 60 * 60};path=/;samesite=none;secure=true;HttpOnly=true`);
                    yield store_1.default.set(username === null || username === void 0 ? void 0 : username.split("@")[0], "registrationId", userObj.registrationId);
                    delete userObj.hashedPassword;
                    userObj.role = "authenticated";
                    const userHealthStats = yield (0, util_2.getHealthStats)(username === null || username === void 0 ? void 0 : username.split("@")[0]);
                    userObj.heath = userHealthStats;
                    return res.status(200).json(userObj);
                }
            }
            return res.status(401).json({
                body: constants_1.MESSAGE.MESSAGE_LOGIN_FAIL,
            });
        }
        catch (ex) {
            console.log(ex);
            res.status(500).send(constants_1.MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
        }
    });
}
exports.login = login;
