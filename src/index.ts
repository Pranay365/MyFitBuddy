import express from "express";
import {
  parseWorkouts,
  createWorkouts,
  readWorkoutsFromDb,
  writeRecordsToDb,
} from "./util";
import { MESSAGE } from "./constants";
import { SECRET } from "./config";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { getUserfromDB, register } from "./auth";
import { hash, compare } from "bcryptjs";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//@ts-ignore
app.post("/signup", async function (req, res, next) {
  const { id, name, password, confirmPassword } = req.body;
  console.log(req.body);
  console.log(id, name, password, confirmPassword);
  const hashedPassword = await hash(password, 8);
  const registrationId: string = await register(
    id,
    name,
    password,
    hashedPassword,
    confirmPassword
  );
  if (registrationId) {
    req.session.registrationId = registrationId;
    console.log(req.session.id);
    return res.status(201).json({
      status: MESSAGE.MESSAGE_REGISTRATION_SUCESS,
      body: JSON.stringify({ registrationId }),
    });
  } else {
    return res.status(400).json({
      status: MESSAGE.MESSAGE_REGISTRATION_FAIL,
      body: JSON.stringify({ message: MESSAGE.MESSAGE_REGISTRATION_FAIL }),
    });
  }
});

const isAuthenticated = async (req: any, res: any, next: any) => {
  const registrationId = req.session.registrationId;
  console.log(registrationId);
  const userObj = await getUserfromDB(registrationId);
  if (userObj) {
    if (userObj.userid == req.params.id) return next();
    else return res.status(403).json(MESSAGE.MESSAGE_UNAUTHORIZED);
  } else {
    return res.status(404).json(MESSAGE.MESSAGE_AUTHENTICATION_FAILED);
  }
};
//@ts-ignore
app.post("/login/:id", async function (req, res) {
  console.log(req.session.id);
  if (req.session.registrationId) {
    return res.status(200).json({
      body: MESSAGE.MESSAGE_LOGIN_SUCCESS,
    });
  }
  const { registrationId, password } = req.body;
  const userObj = await getUserfromDB(registrationId);
  if (userObj) {
    const isAuthenticated = await compare(password, userObj?.hashedPassword);
    if (isAuthenticated) {
      req.session.registrationId = registrationId;
      return res.status(200).json({
        body: MESSAGE.MESSAGE_LOGIN_SUCCESS,
      });
    }
  }
  return res.status(400).json({
    body: MESSAGE.MESSAGE_LOGIN_FAIL,
  });
});

app.get("/workouts/:date/:id", isAuthenticated, async function (req, res) {
  try {
    const { date, id } = req.params;
    let { workoutnames } = req.query;
    console.log(date, id, workoutnames);
    //validate date and id

    const allWorkoutsinJson = await readWorkoutsFromDb(id);

    const workouts = parseWorkouts(
      allWorkoutsinJson,
      date,
      workoutnames as string
    );
    return res.send(workouts);
  } catch (ex: any) {
    console.log(ex);
    if (ex.message.includes("JSON")) {
      res.status(500).json({ err: MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR });
    }
    res.status(404).json({ err: MESSAGE.MESSAGE_WORKOUT_NOT_FOUND });
  }
});
//@ts-ignore
app.post("/workouts/:date/:id", isAuthenticated, async function (req, res) {
  const { date, id } = req.params;
  //const { workouts } = req.body;
  console.log(req.body);
  console.log(JSON.stringify(req.body, null, 2));
  const allWorkoutsinJson = await readWorkoutsFromDb(id);
  const newWorkouts = createWorkouts(allWorkoutsinJson, date, req.body);
  if (newWorkouts) {
    await writeRecordsToDb(id, newWorkouts);
    return res.send(newWorkouts);
  }
  return res.send(MESSAGE.MESSAGE_INAVLID_WORKOUTS);
});
app.listen(3000, () => console.log("started listening"));
