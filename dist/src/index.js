"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./user");
const auth_1 = require("./auth");
const workouts_1 = require("./workouts");
const nutrition_1 = require("./nutrition");
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(body_parser_1.default.json());
app.use("/.netlify/functions/", router);
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
router.get("/", (req, res) => {
    res.send("Hi");
});
router.post("/signup", upload.single("avatar"), auth_1.signup);
router.get("/logout", auth_1.isAuthenticated, auth_1.logout);
router.post("/login", auth_1.login);
// users
router.get("/user", auth_1.isAuthenticated, user_1.user);
router.post("/users/settings", auth_1.isAuthenticated, user_1.userSettings);
router.get("/users/:name/profile", auth_1.isAuthenticated, user_1.getUserProfilePic);
// workouts
router.get("/workouts", auth_1.isAuthenticated, workouts_1.getWorkouts);
router.post("/workouts", auth_1.isAuthenticated, workouts_1.createWorkout);
// nutrition
router.get("/nutrition", auth_1.isAuthenticated, nutrition_1.getNutrition);
router.post("/nutrition", auth_1.isAuthenticated, nutrition_1.saveUsersNutrion);
router.get("/foods", auth_1.isAuthenticated, nutrition_1.getAllAvailableFoods);
//app.listen(process.env.PORT || 3000, () => console.log("started listening"));
exports.handler = (0, serverless_http_1.default)(app);
