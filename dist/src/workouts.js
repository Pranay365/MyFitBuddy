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
exports.createWorkout = exports.getWorkouts = void 0;
const uuid_1 = require("uuid");
const util_1 = require("./util");
const constants_1 = require("./constants");
function getWorkouts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("request received");
            const username = req.user.email.split("@")[0];
            // 1. Get workouts from userid folder
            const workouts = yield (0, util_1.readDataFromDb)(username, "workouts");
            // 2. Send the workouts to ui
            return res.status(200).send(workouts);
            // 3. End
        }
        catch (ex) {
            console.log(ex);
            res.status(500).send("Something went wrong in the server");
        }
    });
}
exports.getWorkouts = getWorkouts;
function createWorkout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { type } = req.body;
            console.log("type is ", type);
            const id = (0, uuid_1.v4)();
            let data = {};
            if (type === "cardio") {
                const { distance, time, name } = req.body;
                if (!distance || !time || !name)
                    return res.status(400).json(constants_1.MESSAGE.MESSAGE_INAVLID_WORKOUTS);
                data = { distance, time, name, type };
            }
            else if (type === "weight") {
                const { name, reps, weight } = req.body;
                if (!name || !reps || !weight)
                    return res.status(400).json(constants_1.MESSAGE.MESSAGE_INAVLID_WORKOUTS);
                data = { reps, weight, name, type };
            }
            else if (type == "bw") {
                const { name, reps } = req.body;
                if (!name || !reps) {
                    return res.status(400).json(constants_1.MESSAGE.MESSAGE_INAVLID_WORKOUTS);
                }
                data = { reps, name, type };
            }
            const username = req.user.email.split("@")[0];
            const newWorkouts = (0, util_1.saveWorkoutsToDb)(username, data);
            return res.status(200).send(newWorkouts);
        }
        catch (ex) {
            console.log(ex);
            return res.status(500).json("Something went wrong in the server");
        }
    });
}
exports.createWorkout = createWorkout;
