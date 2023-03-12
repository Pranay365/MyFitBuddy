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
import { compare } from "bcryptjs";
import { ValidationError } from "yup";

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
  try {
    const { id, name, password, confirmPassword } = req.body;
    console.log(req.body);
    console.log(id, name, password, confirmPassword);
    const registrationId: string = await register(
      id,
      name,
      password,
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
  } catch (ex) {
    if (ex instanceof ValidationError) {
      console.log(JSON.stringify(ex, null, 2));
      return res.status(400).json(MESSAGE.MESSAGE_INVALID_USER);
    }
    return res.status(500).send(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
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
  try {
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
  } catch (ex) {
    console.log(ex);
    res.status(500).send(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
  }
});

app.get("/workouts/:date/:id", isAuthenticated, async function (req, res) {
  try {
    const { date, id } = req.params;
    let { workoutnames } = req.query;
    console.log(date, id, workoutnames);
    //validate date and id
    if (date?.split("-").length == 3 && id) {
      const allWorkoutsinJson = await readWorkoutsFromDb(id);
      const workouts = parseWorkouts(
        allWorkoutsinJson,
        date,
        workoutnames as string
      );
      if (workouts) return res.status(200).send(workouts);
      else return res.status(404).json(MESSAGE.MESSAGE_WORKOUT_NOT_FOUND);
    }
    return res.status(400).json(MESSAGE.MESSAGE_INAVLID_WORKOUTS);
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
  try {
    const { date, id } = req.params;
    //const { workouts } = req.body;
    console.log(req.body);
    console.log(JSON.stringify(req.body, null, 2));
    const allWorkoutsinJson = await readWorkoutsFromDb(id);
    const newWorkouts = await createWorkouts(allWorkoutsinJson, date, req.body);
    if (newWorkouts) {
      await writeRecordsToDb(id, newWorkouts);
      return res.status(201).send(MESSAGE.MESSAGE_SUCCESS);
    }
    return res.send(MESSAGE.MESSAGE_INAVLID_WORKOUTS);
  } catch (ex: any) {
    console.log(ex);
    if (ex.errors) {
      return res.status(400).json(ex.errors);
    }
    return res.status(500).json(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
  }
});
app.listen(3000, () => console.log("started listening"));
