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
const util_1 = require("../src/util");
jest.mock("fs");
describe("test for auth", () => {
    it("should register user and generate uuid and call readfile", () => __awaiter(void 0, void 0, void 0, function* () {
        const registrationId = yield (0, util_1.register)("test1", "test1", "testabcd", "testabcd", "testabcd", "test", undefined);
        expect(registrationId).toMatch(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/);
        expect(process.env.readFileCalls).toBe("1");
        expect(process.env.writeFileCalls).toBe("1");
    }), 15000);
    it("should not register the user as the userdetails are invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, util_1.register)("test1", "test1", "testabcd", "testabcd", "testabcd", "test", undefined);
        }
        catch (ex) {
            expect(process.env.readFileCalls).toBe("1");
            expect(process.env.writeFileCalls).toBe("1");
        }
    }));
    it("should return undefined as there are no users in db and call readFile once", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield (0, util_1.getUserfromDB)("1234");
        expect(user).not.toBeDefined();
        expect(process.env.readFileCalls).toBe("2");
        expect(process.env.writeFileCalls).toBe("1");
    }));
});
