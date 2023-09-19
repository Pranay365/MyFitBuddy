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
exports.getAllAvailableFoods = exports.saveUsersNutrion = exports.getNutrition = void 0;
const util_1 = require("./util");
function getNutrition(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("request received");
        // 1. Read userid from cookies
        const username = req.user.email.split("@")[0];
        // 1. Get workouts from userid folder
        const nutrition = yield (0, util_1.readDataFromDb)(username, "nutrition");
        // 2. Send the workouts to ui
        res.status(200).send(nutrition);
    });
}
exports.getNutrition = getNutrition;
function saveUsersNutrion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = req.user.email.split("@")[0];
        const newNutritionDetails = yield (0, util_1.saveNutritionDetailsToDB)(username, req.body);
        return res.status(200).send(newNutritionDetails);
    });
}
exports.saveUsersNutrion = saveUsersNutrion;
function getAllAvailableFoods(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allFoods = yield (0, util_1.getAllFoodsFromDB)();
            return res.status(200).send(allFoods);
        }
        catch (ex) {
            console.log(ex);
            res.status(500).send("Internal Server Error");
        }
    });
}
exports.getAllAvailableFoods = getAllAvailableFoods;
