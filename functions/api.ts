import express from "express";

//import multer from "multer";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
// import { getUserProfilePic, user, userSettings } from "./user";
import {
  login,
  signup,
  getUser,
  saveUserSettings,
} from "../src/user/authController";
import { authorized } from "../src/middleware/authorized";
import {
  createWorkout,
  getWorkoutById,
  getWorkouts,
} from "../src/workouts/workoutController";
import {
  getAllAvailableFoods,
  getUsersNutrition,
  saveUsersNutrion,
} from "../src/nutrition/nutritionController";

import asyncHandler from "../src/middleware/asyncHandler";
import errorHandler from "../src/middleware/ErrorHandler";
import { connectDb } from "../src/middleware/connectDb";
import { serviceLocator } from "../src/serviceLocator";
import { User } from "../src/models/user";
import { Workout } from "../src/models/workout";
import { Foods } from "../src/models/foods";
import { Nutrition } from "../src/models/nutrition";
import { Stats } from "../src/models/stats";

const app = express();
const router = express.Router();

serviceLocator.register("User", User);
serviceLocator.register("Workout", Workout);
serviceLocator.register("Foods", Foods);
serviceLocator.register("Nutrition", Nutrition);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api/", router);

router.get("/", (req, res) => {
  res.send("Hi");
});
router.get("/hello", connectDb, authorized, function (req: any, res, next) {
  res.status(200).json({ success: true, data: req.user });
});
router.post("/signup", connectDb, asyncHandler(signup));

// router.get("/logout", isAuthenticated, logout);

router.post("/login", connectDb, asyncHandler(login));

router.get("/user/me", connectDb, authorized, asyncHandler(getUser));

router.post(
  "/user/settings",
  connectDb,
  authorized,
  asyncHandler(saveUserSettings)
);

// workouts

router.get("/workouts", connectDb, authorized, asyncHandler(getWorkouts));
router.get(
  "/workouts/:id",
  connectDb,
  authorized,
  asyncHandler(getWorkoutById)
);

router.post("/workouts", connectDb, authorized, asyncHandler(createWorkout));

// nutrition
router.get(
  "/nutrition",
  connectDb,
  authorized,
  asyncHandler(getUsersNutrition)
);

router.post(
  "/nutrition",
  connectDb,
  authorized,
  asyncHandler(saveUsersNutrion)
);

router.get("/foods", connectDb, authorized, asyncHandler(getAllAvailableFoods));

app.use(errorHandler);
//app.listen(process.env.PORT || 3000, () => console.log("started listening"));
export const handler = serverless(app);
