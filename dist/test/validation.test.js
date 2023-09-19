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
const yup_1 = require("yup");
const validation_1 = require("../src/validation");
describe("test for validating user details", () => {
    it("should validate user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = {
            id: "test1",
            name: "test1",
            password: "test1234",
            confirmPassword: "test1234",
        };
        const valid = yield (0, validation_1.isValidUser)(user);
        expect(valid).toEqual(user);
    }));
    it("should throw validation error as user details are missing", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, validation_1.isValidUser)({});
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toBe(true);
        }
    }));
    it("should throw validation error - password less than 6 charcters", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, validation_1.isValidUser)({
                id: "test1",
                name: "test1",
                password: "abcd",
                confirmPassword: "abcd",
            });
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toBe(true);
        }
    }));
    it("should throw validation error - password and confirmPassword don't match", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, validation_1.isValidUser)({
                id: "test1",
                name: "test1",
                password: "abcdefghi",
                confirmPassword: "abcd",
            });
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toBe(true);
        }
    }));
    it("should validate workouts successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const workouts = {
            clockin: "9:30",
            workouts: { squats: [{ reps: 10, weight: 30 }] },
        };
        const workoutsAftervalidation = yield (0, validation_1.isValidWorkouts)(workouts);
        expect(workoutsAftervalidation).toStrictEqual(workouts);
    }));
    it("should throw error as the workouts structure is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                clockin: "9:30",
                workouts: { squats: [] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - missing reps and weight", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                clockin: "9:30",
                workouts: { squats: [{}] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - missing weight", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                clockin: "9:30",
                workouts: { squats: [{ reps: 10 }] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - missing reps", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                clockin: "9:30",
                workouts: { squats: [{ weight: 10 }] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - missing workouts collection", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                clockin: "9:30",
                workouts: {},
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - reps 0", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                clockin: "9:30",
                workouts: { squats: [{ reps: 0, weight: 10 }] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - weight 0", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                clockin: "9:30",
                workouts: { squats: [{ reps: 10, weight: 0 }] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - missing clockin", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                workouts: { squats: [{ reps: 10, weight: 0 }] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
    it("should throw error as the workouts structure is invalid - reps string", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workouts = {
                workouts: { squats: [{ reps: "10", weight: 10 }] },
            };
            yield (0, validation_1.isValidWorkouts)(workouts);
        }
        catch (ex) {
            expect(ex instanceof yup_1.ValidationError).toStrictEqual(true);
        }
    }));
});
