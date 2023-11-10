import express from "express";

//import multer from "multer";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { getUserProfilePic, user, userSettings } from "./user";
import { authorized, login, signup } from "../src/auth";
import { createWorkout, getWorkouts } from "../src/workouts";
import {
  getAllAvailableFoods,
  getUsersNutrition,
  saveUsersNutrion,
} from "../src/nutrition";
import { getUser, saveUserSettings } from "../src/user";
import asyncHandler from "../src/middleware/asyncHandler";
import errorHandler from "../src/middleware/ErrorHandler";
import { connectDb } from "../src/middleware/connectDb";
import {photoHandler} from "../src/middleware/photoHandler";
const app = express();
const router = express.Router();

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");
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

// router.get("/users/:name/profile", isAuthenticated, getUserProfilePic);

// // workouts

router.get("/workouts", connectDb, authorized, asyncHandler(getWorkouts));

router.post("/workouts", connectDb, authorized, asyncHandler(createWorkout));

// // nutrition
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
