"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
//import multer from "multer";
const serverless_http_1 = __importDefault(require("serverless-http"));
const body_parser_1 = __importDefault(require("body-parser"));
// import { getUserProfilePic, user, userSettings } from "./user";
// import { isAuthenticated, login, logout, signup } from "./auth";
// import { createWorkout, getWorkouts } from "./workouts";
// import {
//   getAllAvailableFoods,
//   getNutrition,
//   saveUsersNutrion,
// } from "./nutrition";
const app = (0, express_1.default)();
const router = express_1.default.Router();
//app.use(cors({ origin: "*" }));
app.use(body_parser_1.default.json());
app.use("/.netlify/functions/", router);
// const upload = multer({
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     console.log("file is", file);
//     if (file && !file.originalname.toLowerCase().match(/\.(png|jpg|jpeg)$/))
//       return cb(new Error("Please upload png or jpg images"));
//     cb(null, true);
//   },
// });
// authentication
router.get("/", (req, res) => {
    res.send("Hi");
});
// router.post("/signup", upload.single("avatar"), signup);
// router.get("/logout", isAuthenticated, logout);
// router.post("/login", login);
// // users
// router.get("/user", isAuthenticated, user);
// router.post("/users/settings", isAuthenticated, userSettings);
// router.get("/users/:name/profile", isAuthenticated, getUserProfilePic);
// // workouts
// router.get("/workouts", isAuthenticated, getWorkouts);
// router.post("/workouts", isAuthenticated, createWorkout);
// // nutrition
// router.get("/nutrition", isAuthenticated, getNutrition);
// router.post("/nutrition", isAuthenticated, saveUsersNutrion);
// router.get("/foods", isAuthenticated, getAllAvailableFoods);
//app.listen(process.env.PORT || 3000, () => console.log("started listening"));
exports.handler = (0, serverless_http_1.default)(app);
