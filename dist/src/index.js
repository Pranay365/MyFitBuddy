"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./user");
const auth_1 = require("./auth");
const workouts_1 = require("./workouts");
const nutrition_1 = require("./nutrition");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["*", "http://localhost:5173"],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}));
app.use(body_parser_1.default.json());
const upload = (0, multer_1.default)({
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
app.post("/signup", upload.single("avatar"), auth_1.signup);
app.get("/logout", auth_1.isAuthenticated, auth_1.logout);
app.post("/login", auth_1.login);
// users 
app.get("/user", auth_1.isAuthenticated, user_1.user);
app.post("/users/settings", auth_1.isAuthenticated, user_1.userSettings);
app.get("/users/:name/profile", auth_1.isAuthenticated, user_1.getUserProfilePic);
// workouts
app.get("/workouts", auth_1.isAuthenticated, workouts_1.getWorkouts);
app.post("/workouts", auth_1.isAuthenticated, workouts_1.createWorkout);
// nutrition
app.get("/nutrition", auth_1.isAuthenticated, nutrition_1.getNutrition);
app.post("/nutrition", auth_1.isAuthenticated, nutrition_1.saveUsersNutrion);
app.get("/foods", auth_1.isAuthenticated, nutrition_1.getAllAvailableFoods);
app.listen(process.env.PORT || 3000, () => console.log("started listening"));
