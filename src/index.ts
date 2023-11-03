import express from "express";

//import multer from "multer";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getUserProfilePic, user, userSettings } from "./user";
import { login, signup } from "./auth";
import { createWorkout, getWorkouts } from "./workouts";
import {
  getAllAvailableFoods,
  getNutrition,
  saveUsersNutrion,
} from "./nutrition";
import mongoose from "mongoose";
const app = express();
const router = express.Router();

async function connectDb(req,res,next) {
  const con = await mongoose.connect(
    "mongodb+srv://pranayprasad:Pranay%409876@cluster0.cnnp0mj.mongodb.net/devCamper?retryWrites=true&w=majority"
  );
  console.log(`MongoDb connected `, con);
  if(con) next();
}

app.use(cors({ origin: "*" }));

app.use(bodyParser.json());
app.use(cookieParser());
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
router.post("/signup",connectDb, signup);

// router.get("/logout", isAuthenticated, logout);

router.post("/login",connectDb, login);

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
export const handler = serverless(app);
