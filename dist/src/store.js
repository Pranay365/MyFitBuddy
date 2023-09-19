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
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class Store {
    constructor() {
        this.cookies = [];
    }
    destroy(index) {
        this.cookies.splice(index, 1);
        return (0, util_1.writeFilePromise)(__dirname + "/session.json", JSON.stringify(this.cookies));
    }
    isValid(name, value, username) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cookies.length)
                this.cookies = JSON.parse((yield (0, util_1.readFilePromise)(__dirname + "/session.json", "utf-8")) || "[]");
            return !!((_a = this.cookies) === null || _a === void 0 ? void 0 : _a.find(cookie => cookie.username == username && cookie.name == name && cookie.value == value && cookie.expires > new Date().toISOString()));
        });
    }
    get(value) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let cookie, foundIndex = -1;
            if (!this.cookies.length) {
                this.cookies = JSON.parse((yield (0, util_1.readFilePromise)(__dirname + "/session.json", "utf-8")) || "[]");
            }
            for (let i = 0; i < ((_a = this.cookies) === null || _a === void 0 ? void 0 : _a.length); i++) {
                if (this.cookies[i].value === value) {
                    cookie = this.cookies[i];
                    foundIndex = i;
                    break;
                }
            }
            if ((cookie === null || cookie === void 0 ? void 0 : cookie.expires) < new Date().toISOString()) { // cookie has expired
                this.destroy(foundIndex);
                return;
            }
            return cookie;
        });
    }
    set(username, name, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cookies.length)
                this.cookies = JSON.parse((yield (0, util_1.readFilePromise)(__dirname + "/session.json", "utf-8")) || "[]");
            let expires = new Date().getTime() + 24 * 60 * 60 * 1000;
            this.cookies = this.cookies.filter(cookie => cookie.value !== value);
            this.cookies.push({ name, value, username, expires: new Date(expires).toISOString() });
            return (0, util_1.writeFilePromise)(__dirname + "/session.json", JSON.stringify(this.cookies));
        });
    }
    remove(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cookies.length)
                this.cookies = JSON.parse((yield (0, util_1.readFilePromise)(__dirname + "/session.json", "utf-8")) || "[]");
            this.cookies = this.cookies.filter(cookie => cookie.value !== value);
            return (0, util_1.writeFilePromise)(__dirname + "/session.json", JSON.stringify(this.cookies));
        });
    }
}
exports.default = new Store();
