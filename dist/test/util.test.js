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
describe("test for managing workouts", () => {
    const allWorkoutsinJson = JSON.stringify({
        "2023-03-07": {
            clockin: "09:30",
            workouts: {
                squats: [
                    {
                        reps: 10,
                        weight: 10,
                        time: "9:35",
                    },
                ],
            },
        },
    });
    it("should parseWorkouts successfully", () => {
        const workouts = (0, util_1.parseWorkouts)(allWorkoutsinJson, "2023-03-07");
        expect(workouts).toStrictEqual({
            squats: [
                {
                    reps: 10,
                    weight: 10,
                    time: "9:35",
                },
            ],
        });
        const workoutsUndefined = (0, util_1.parseWorkouts)(JSON.stringify({}), "2023-03-07");
        expect(workoutsUndefined).not.toBeDefined();
    });
    it("should parseWorkouts with workoutnames successfully", () => {
        const allWorkoutsinJson = JSON.stringify({
            "2023-03-07": {
                clockin: "09:30",
                workouts: {
                    squats: [
                        {
                            reps: 10,
                            weight: 10,
                            time: "9:35",
                        },
                    ],
                    deadlifts: [
                        {
                            reps: 10,
                            weight: 10,
                            time: "9:45",
                        },
                    ],
                },
            },
        });
        const workouts = (0, util_1.parseWorkouts)(allWorkoutsinJson, "2023-03-07", "squats,deadlifts");
        expect(workouts).toStrictEqual([
            [
                {
                    reps: 10,
                    weight: 10,
                    time: "9:35",
                },
            ],
            [
                {
                    reps: 10,
                    weight: 10,
                    time: "9:45",
                },
            ],
        ]);
    });
    it("should add or replace the workouts for a given date when the complete new workout is provided ", () => __awaiter(void 0, void 0, void 0, function* () {
        let workoutsToSave = {
            clockin: "9:30",
            workouts: { deadlifts: [{ reps: 10, weight: 10, time: "9:30" }] },
        };
        const newWorkouts = yield (0, util_1.createWorkouts)(allWorkoutsinJson, "2023-03-07", workoutsToSave);
        expect(newWorkouts).toEqual(JSON.stringify({ "2023-03-07": workoutsToSave }));
    }));
    it("should add the workouts to existing set of a workout when the workouts is provided in sets", () => __awaiter(void 0, void 0, void 0, function* () {
        let workoutsToSave = {
            workouts: {
                squats: [{ reps: 20, weight: 20, time: "11:30" }],
            },
        };
        const newWorkouts = yield (0, util_1.createWorkouts)(allWorkoutsinJson, "2023-03-07", workoutsToSave);
        let workoutsAfterAddition = {
            "2023-03-07": {
                clockin: "09:30",
                workouts: {
                    squats: [
                        {
                            reps: 10,
                            weight: 10,
                            time: "9:35",
                        },
                        {
                            reps: 20,
                            weight: 20,
                            time: "11:30",
                        },
                    ],
                },
            },
        };
        expect(newWorkouts).toEqual(JSON.stringify(workoutsAfterAddition));
    }));
    it("should be call writeFile once to create a workout when exception occurs", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, util_1.writeRecordsToDb)("test1", "{}");
        expect(process.env.writeFileCalls).toBe("2");
    }));
});
