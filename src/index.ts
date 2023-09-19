import express from "express";

import multer from "multer";
import bodyParser from "body-parser";
import cors from "cors";
import {  getUserProfilePic, user, userSettings } from "./user";
import { isAuthenticated, login, logout, signup } from "./auth";
import { createWorkout, getWorkouts } from "./workouts";
import { getAllAvailableFoods, getNutrition, saveUsersNutrion } from "./nutrition";
const app = express();

app.use(
  cors({
    origin: ["*", "http://localhost:5173"],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

app.use(bodyParser.json());

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    console.log("file is", file);
    if (file && !file.originalname.toLowerCase().match(/\.(png|jpg|jpeg)$/))
      return cb(new Error("Please upload png or jpg images"));
    cb(null, true);
  },
});

// authentication

app.post("/signup", upload.single("avatar"), signup);

app.get("/logout", isAuthenticated, logout);

app.post("/login",login);

// users 
app.get("/user", isAuthenticated, user);

app.post("/users/settings", isAuthenticated, userSettings);

app.get("/users/:name/profile", isAuthenticated,getUserProfilePic);

// workouts

app.get("/workouts", isAuthenticated, getWorkouts);

app.post("/workouts", isAuthenticated,createWorkout );

// nutrition
app.get("/nutrition", isAuthenticated,getNutrition);

app.post("/nutrition", isAuthenticated, saveUsersNutrion);

app.get("/foods", isAuthenticated,getAllAvailableFoods);

app.listen(process.env.PORT || 3000, () => console.log("started listening"));
