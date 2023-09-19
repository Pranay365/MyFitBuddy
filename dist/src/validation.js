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
exports.isValidWorkouts = exports.isValidUser = void 0;
const yup_1 = require("yup");
const workoutSchema = (0, yup_1.object)({
    clockin: (0, yup_1.string)(),
    clockout: (0, yup_1.string)(),
    workouts: (0, yup_1.lazy)((workouts = {}) => {
        let keys = Object.keys(workouts);
        if (keys.length < 1)
            throw new yup_1.ValidationError(`Atleast one workout should be added`);
        let schema = keys.reduce((acc, cur) => (Object.assign(Object.assign({}, acc), { [cur]: (0, yup_1.array)()
                .of((0, yup_1.object)().shape({
                reps: (0, yup_1.number)().min(1).required(),
                weight: (0, yup_1.number)().min(1).required(`${cur} should `),
            }))
                .min(1) })), {});
        return (0, yup_1.object)().shape(schema);
    }),
});
const userSchema = (0, yup_1.object)({
    username: (0, yup_1.string)().min(4).max(10).matches(/\w/).required(),
    password: (0, yup_1.string)().min(6).max(8).required(),
    confirmPassword: (0, yup_1.string)()
        .oneOf([(0, yup_1.ref)("password")])
        .required(),
});
function isValidUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield userSchema.validate(user);
    });
}
exports.isValidUser = isValidUser;
function isValidWorkouts(workouts) {
    return __awaiter(this, void 0, void 0, function* () {
        let validatedWorkouts = yield workoutSchema.validate(workouts);
        return validatedWorkouts;
    });
}
exports.isValidWorkouts = isValidWorkouts;
