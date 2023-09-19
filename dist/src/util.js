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
exports.writeRecordsToDb = exports.saveSettings = exports.saveNutritionDetailsToDB = exports.saveWorkoutsToDb = exports.saveNutrionToDb = exports.getAllFoodsFromDB = exports.readDataFromDb = exports.createWorkouts = exports.parseWorkouts = exports.getCookies = exports.getUserfromDB = exports.getUserProfile = exports.register = exports.getHealthStats = exports.mkdirPromise = exports.writeFilePromise = exports.readFilePromise = void 0;
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = require("path");
const validation_1 = require("./validation");
const uuid_1 = require("uuid");
const bcryptjs_1 = require("bcryptjs");
exports.readFilePromise = (0, util_1.promisify)(fs_1.readFile);
exports.writeFilePromise = (0, util_1.promisify)(fs_1.writeFile);
exports.mkdirPromise = (0, util_1.promisify)(fs_1.mkdir);
function getHealthStats(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `${(0, path_1.join)(__dirname, username, "stats")}.json`;
        const healthStats = (yield (0, exports.readFilePromise)(filePath, "utf-8")) || "``";
        return JSON.parse(healthStats);
    });
}
exports.getHealthStats = getHealthStats;
function register(username, password, confirmPassword, email, first_name, last_name, avatar) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, validation_1.isValidUser)({ username, password, confirmPassword });
        const hashedPassword = yield (0, bcryptjs_1.hash)(password, 8);
        const registrationId = (0, uuid_1.v4)();
        const date = new Date();
        const filePath = `${(0, path_1.join)(__dirname, "users")}.json`;
        const userDir = `${(0, path_1.join)(__dirname, username)}`;
        const statsPath = `${(0, path_1.join)(userDir, "stats")}.json`;
        const nutritionPath = `${(0, path_1.join)(userDir, "nutrition")}.json`;
        const workoutsPath = `${(0, path_1.join)(userDir, "workouts")}.json`;
        const usrObj = {
            [username]: {
                registrationId,
                hashedPassword,
                createdAt: date.toISOString(),
                email,
                first_name,
                last_name,
                avatar,
            },
        };
        const existingUsersInJson = (yield (0, exports.readFilePromise)(filePath, "utf-8")) || JSON.stringify({});
        let existingUsers = JSON.parse(existingUsersInJson);
        existingUsers = Object.assign(Object.assign({}, existingUsers), usrObj);
        yield (0, exports.writeFilePromise)(filePath, JSON.stringify(existingUsers));
        yield (0, exports.mkdirPromise)(userDir);
        yield (0, exports.writeFilePromise)(statsPath, JSON.stringify({}));
        yield (0, exports.writeFilePromise)(nutritionPath, JSON.stringify([]));
        yield (0, exports.writeFilePromise)(workoutsPath, JSON.stringify([]));
        return registrationId;
    });
}
exports.register = register;
function getUserProfile(username) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const profileJSON = yield (0, exports.readFilePromise)(`${(0, path_1.join)(__dirname, "users")}.json`, "utf-8");
        const profile = JSON.parse(profileJSON);
        console.log(profile[username], username);
        return ((_a = profile[username]) === null || _a === void 0 ? void 0 : _a.avatar)
            ? Buffer.from((_b = profile[username]) === null || _b === void 0 ? void 0 : _b.avatar)
            : undefined;
    });
}
exports.getUserProfile = getUserProfile;
function getUserfromDB(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filePath = `${(0, path_1.join)(__dirname, "users")}.json`;
            const userObjInJson = yield (0, exports.readFilePromise)(filePath, "utf-8");
            const userObj = JSON.parse(userObjInJson);
            return userObj[username];
        }
        catch (ex) {
            return;
        }
    });
}
exports.getUserfromDB = getUserfromDB;
function getCookies(req) {
    var _a;
    const reqCookie = (_a = req.headers.cookie) === null || _a === void 0 ? void 0 : _a.split(";");
    const cookies = reqCookie === null || reqCookie === void 0 ? void 0 : reqCookie.reduce((acc, el) => {
        const [name, value] = el.split("=");
        acc[name.trim()] = value.trim();
        return acc;
    }, {});
    console.log(cookies);
    return cookies || {};
}
exports.getCookies = getCookies;
function parseWorkouts(allWorkoutsinJson, date, workoutnamesInqs) {
    let savedWorkouts = JSON.parse(allWorkoutsinJson)[date];
    if (workoutnamesInqs) {
        let workoutnames = workoutnamesInqs.split(",");
        let workouts = workoutnames
            .map((name) => savedWorkouts === null || savedWorkouts === void 0 ? void 0 : savedWorkouts.workouts[name.toLocaleLowerCase()])
            .filter((workout) => workout);
        return workouts;
    }
    else {
        return savedWorkouts === null || savedWorkouts === void 0 ? void 0 : savedWorkouts.workouts;
    }
}
exports.parseWorkouts = parseWorkouts;
//1) check if the workouts exist, if yes then append else write
// prettier-ignore
function createWorkouts(allWorkoutsinJson, date, workoutsToSave) {
    return __awaiter(this, void 0, void 0, function* () {
        let allWorkoutsObj = JSON.parse(allWorkoutsinJson || `""`);
        let existingWorkoutsInDB = allWorkoutsObj;
        let newWorkouts;
        //@ts-ignore
        let completeWorkout = workoutsToSave;
        yield (0, validation_1.isValidWorkouts)(workoutsToSave);
        if (
        //@ts-ignore
        (completeWorkout === null || completeWorkout === void 0 ? void 0 : completeWorkout.clockin) && completeWorkout.workouts) {
            //replace{date:{}}
            newWorkouts = Object.assign(Object.assign({}, existingWorkoutsInDB), { [date]: completeWorkout });
            allWorkoutsObj = newWorkouts;
        }
        else {
            // workouts has been provided in sets
            //@ts-ignore
            let workoutsToSaveInSets = workoutsToSave.workouts;
            Object.keys(workoutsToSave.workouts).forEach((workoutName) => {
                existingWorkoutsInDB[date].workouts[workoutName] = existingWorkoutsInDB[date].workouts[workoutName] || [];
                existingWorkoutsInDB[date].workouts[workoutName] = [...existingWorkoutsInDB[date].workouts[workoutName], ...workoutsToSaveInSets[workoutName],
                ];
            });
            allWorkoutsObj = existingWorkoutsInDB;
        }
        // allStatsObj.workouts[date].workouts = [...allStatsObj.workouts[date].workouts, ...workoutsToSave];
        return JSON.stringify(allWorkoutsObj);
    });
}
exports.createWorkouts = createWorkouts;
function readDataFromDb(id, type) {
    return __awaiter(this, void 0, void 0, function* () {
        //{date:{}}
        const filePath = `${(0, path_1.join)(__dirname, id, type)}.json`;
        const emptyData = JSON.stringify({});
        try {
            const allrecords = yield (0, exports.readFilePromise)(filePath, "utf-8");
            return allrecords;
        }
        catch (ex) {
            if (ex.code === "ENOENT") {
                yield (0, exports.writeFilePromise)(filePath, emptyData);
            }
            return emptyData;
        }
    });
}
exports.readDataFromDb = readDataFromDb;
function getAllFoodsFromDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `${(0, path_1.join)(__dirname, "data", "foods")}.json`;
        const allFoods = yield (0, exports.readFilePromise)(filePath, "utf-8");
        return allFoods;
    });
}
exports.getAllFoodsFromDB = getAllFoodsFromDB;
function saveNutrionToDb(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        //1. read all nutrition details for this id
        //2. if nutrion exists add to current date
        //3. else create a new entry for todays date and add carb,fat,protein and cal to it
        //3. save the details to db.
        const filePath = `${(0, path_1.join)(__dirname, id, "nutrition")}.json`;
        yield (0, exports.writeFilePromise)(filePath, data);
        const allNutrition = yield (0, exports.readFilePromise)(filePath, "utf-8");
        return allNutrition;
    });
}
exports.saveNutrionToDb = saveNutrionToDb;
function saveWorkoutsToDb(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let dataToSave = {};
        const filePath = `${(0, path_1.join)(__dirname, id, "workouts")}.json`;
        try {
            const existingDataInDB = yield (0, exports.readFilePromise)(filePath, "utf-8");
            let existingWorkouts = JSON.parse(existingDataInDB);
            if (existingDataInDB) {
                const todaysWorkout = existingWorkouts === null || existingWorkouts === void 0 ? void 0 : existingWorkouts.find((w) => w.date == new Date().toISOString().split("T")[0]);
                if (todaysWorkout) {
                    dataToSave = Object.assign(Object.assign({}, todaysWorkout), { clockout: getFormattedTime(), workouts: [...todaysWorkout.workouts, data] });
                    existingWorkouts = existingWorkouts.filter((w) => w.date !== new Date().toISOString().split("T")[0]);
                }
                else {
                    dataToSave = {
                        clockin: getFormattedTime(),
                        clockout: getFormattedTime(),
                        date: new Date().toISOString().split("T")[0],
                        workouts: [data],
                    };
                    console.log(dataToSave);
                }
            }
            else {
                dataToSave = {
                    clockin: new Date().toISOString().split("T")[1].split("Z")[0],
                    clockout: new Date().toISOString().split("T")[1].split("Z")[0],
                    date: new Date().toISOString().split("T")[0],
                    workouts: [data],
                };
            }
            yield (0, exports.writeFilePromise)(filePath, JSON.stringify([...existingWorkouts, dataToSave]));
            const newWorkouts = yield readDataFromDb(id, "workouts");
            return newWorkouts;
        }
        catch (ex) {
            if (ex.code === "ENOENT") {
                yield (0, exports.writeFilePromise)(filePath, `""`);
            }
        }
    });
}
exports.saveWorkoutsToDb = saveWorkoutsToDb;
function getTodaysDate() {
    return new Date().toISOString().split("T")[0];
}
function getFoodDetails(foodName) {
    return __awaiter(this, void 0, void 0, function* () {
        const allFoods = JSON.parse(yield getAllFoodsFromDB());
        return allFoods.find((food) => food.name === foodName);
    });
}
function calculateCaloriesFromQty(calPer100, quantity) {
    return (calPer100 / 100) * quantity;
}
function saveNutritionDetailsToDB(id, rawNutrionData) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `${(0, path_1.join)(__dirname, id, "nutrition")}.json`;
        try {
            const existingDataInDB = yield (0, exports.readFilePromise)(filePath, "utf-8");
            let allentries = JSON.parse(existingDataInDB) || [];
            let todaysNutrition = allentries.find((entry) => entry.date === getTodaysDate()) || {};
            yield Promise.all(rawNutrionData.map(({ id, foodName, quantity }) => __awaiter(this, void 0, void 0, function* () {
                const foodData = yield getFoodDetails(foodName);
                const { carbohydrates: carbPer100, fat: fatPer100, protein: proteinPer100, } = foodData;
                const carbInFood = calculateCaloriesFromQty(carbPer100, quantity);
                const fatInFood = calculateCaloriesFromQty(fatPer100, quantity);
                const proteinInFood = calculateCaloriesFromQty(proteinPer100, quantity);
                const totalCal = carbInFood + proteinInFood + fatInFood;
                todaysNutrition.id = todaysNutrition.id || id;
                todaysNutrition.date = todaysNutrition.date || getTodaysDate();
                todaysNutrition.carb = (todaysNutrition.carb || 0) + carbInFood;
                todaysNutrition.fat = (todaysNutrition.fat || 0) + fatInFood;
                todaysNutrition.protein =
                    (todaysNutrition.protein || 0) + proteinInFood;
                todaysNutrition.calories = (todaysNutrition.calories || 0) + totalCal;
                todaysNutrition.nutrition = !todaysNutrition.nutrition
                    ? [{ foodName, quantity }]
                    : [...todaysNutrition.nutrition, { foodName, quantity }];
            })));
            allentries = allentries.filter((entry) => entry.date !== getTodaysDate());
            allentries = [...allentries, todaysNutrition];
            yield (0, exports.writeFilePromise)(filePath, JSON.stringify(allentries));
            const newNutritionDetails = yield (0, exports.readFilePromise)(filePath, "utf-8");
            return newNutritionDetails;
        }
        catch (ex) {
            console.log(ex);
        }
    });
}
exports.saveNutritionDetailsToDB = saveNutritionDetailsToDB;
function saveSettings(username, heartbeat, maintenance_cal, sleep) {
    return __awaiter(this, void 0, void 0, function* () {
        const filepath = `${(0, path_1.join)(__dirname, username, "stats")}.json`;
        const allSettingsJSON = yield (0, exports.readFilePromise)(filepath, "utf-8");
        const allSettings = JSON.parse(allSettingsJSON);
        const newSettings = Object.assign(Object.assign({}, allSettings), { heartbeat, sleep, maintenance_cal });
        yield (0, exports.writeFilePromise)(filepath, JSON.stringify(newSettings));
        return newSettings;
    });
}
exports.saveSettings = saveSettings;
function writeRecordsToDb(id, newWorkouts) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `${(0, path_1.join)(__dirname, "workouts", id)}.json`;
        try {
            return yield (0, exports.writeFilePromise)(filePath, newWorkouts);
        }
        catch (ex) {
            throw new Error(`Unable to save the workouts`);
        }
    });
}
exports.writeRecordsToDb = writeRecordsToDb;
function getFormattedTime() {
    let time = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(new Date().toISOString());
    return time[2];
}
// export async function readStatsForWorkout(
//   id: string,
//   workoutname: string,
//   startDate: string,
//   endDate: string
// ) {
//   // call filesystem to get the stats for a workout
//   try {
//     let filepath = `${join(__dirname, "workouts", id)}.json`;
//     const workoutRecordInJson = await readFilePromise(filepath, "utf-8");
//     const workoutRecordObj = JSON.parse(workoutRecordInJson);
//     // parse workoutsrecord and find the given workoutname stats
//     let dates = [];
//     const startTime = new Date(startDate).getTime();
//     const endTime = new Date(endDate).getTime();
//     let currentTime = startTime;
//     while (currentTime <= endTime) {
//       dates.push(new Date(currentTime).toISOString().split("T")[0]);
//       currentTime += 24 * 60 * 60 * 1000;
//     }
//     const allWorkoutStats = dates.reduce((acc: any, el) => {
//       if (workoutRecordObj[el]?.workouts[workoutname]) {
//         acc.push({ [el]: workoutRecordObj[el].workouts[workoutname] });
//       }
//       return acc;
//     }, []);
//     return allWorkoutStats;
//   } catch (ex) {
//     console.log("No Workout Found for this user");
//     return;
//   }
// }
