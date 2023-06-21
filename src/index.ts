import express from "express";
import {
  getCookies,
  parseWorkouts,
  createWorkouts,
  readWorkoutsFromDb,
  writeRecordsToDb,
  readStatsForWorkout,
} from "./util";
import { MESSAGE } from "./constants";
import bodyParser from "body-parser";
import cors from "cors";
import { v4 } from "uuid";
import { getUserfromDB, register } from "./auth";
import { compare } from "bcryptjs";
import { ValidationError } from "yup";
import store from "./store";
const app = express();

app.use(
  cors({
    origin: "http://localhost:9000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(bodyParser.json());

//@ts-ignore
app.post("/signup", async function (req, res, next) {
  try {
    const { username, password, confirmPassword } = req.body;
    console.log(req.body);
    console.log(username, password, confirmPassword);
    const registrationId: string = await register(
      username,
      password,
      confirmPassword
    );
    if (registrationId) {
         res.setHeader(
           "Set-cookie",
           `registrationId=${registrationId};Max-Age=${
             24 * 60 * 60 
           };path=/;HttpOnly=true`
         );
      await store.set(username, "rigistrationId", v4());
      return res.status(200).json({
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
  try {
    let reqCookie = getCookies(req);
    const resCookie = await store.get(reqCookie.registrationId);
    if (resCookie) {
      const userObj = await getUserfromDB(resCookie?.username);
      if (userObj) {
        req.userObj = userObj;
        return next();
      }
    } else {
      return res.status(403).json(MESSAGE.MESSAGE_AUTHENTICATION_FAILED);
    }
  } catch (ex: any) {
    console.log(ex);
  }
};
app.post("/login", async function (req, res) {
  try {
    let reqCookie = getCookies(req);
    console.log("cookies is ", reqCookie);
    const resCookie = await store.get(reqCookie.registrationId);
    if (resCookie) {
      console.log(resCookie);
      res.setHeader(
        "Set-cookie",
        `registrationId=${resCookie.value};Expires=${new Date(
          resCookie.expires
        )};path=/;HttpOnly=true`
      );
      return res.status(200).json({
        status: 200,
        body: MESSAGE.MESSAGE_LOGIN_SUCCESS,
      });
    }
    const { username, password } = req.body;
    const userObj = await getUserfromDB(username);
    console.log(userObj);
    if (userObj) {
      const isAuthenticated = await compare(password, userObj?.hashedPassword);
      if (isAuthenticated) {
        //req.session.registrationId = registrationId;
        res.setHeader(
          "Set-cookie",
          `registrationId=${userObj.registrationId};Max-Age=${
            24 * 60 * 60 
          };path=/;HttpOnly=true`
        );
        await store.set(username, "registrationId", userObj.registrationId);
        return res.status(200).json({
          status: 200,
          body: MESSAGE.MESSAGE_LOGIN_SUCCESS,
        });
      }
    }
    return res.status(401).json({
      body: MESSAGE.MESSAGE_LOGIN_FAIL,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).send(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
  }
});

app.get("/workouts/:date/:id", isAuthenticated, async function (req: any, res) {
  try {
    const { date, id } = req.params;
    let { workoutnames } = req.query;
    console.log(date, req.userObj.name, workoutnames);
    //validate date and id
    if (date?.split("-").length == 3 && req.userObj.name) {
      const allWorkoutsinJson = await readWorkoutsFromDb(req.userObj.name);
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
app.get("/stats/:id/:workoutName", isAuthenticated, async (req, res) => {
  const { id, workoutName } = req.params;
  const { startDate, endDate } = req.query;
  if (
    typeof startDate == "string" &&
    typeof endDate == "string" &&
    typeof id == "string" &&
    typeof workoutName == "string"
  ) {
    const allWorkouts = await readStatsForWorkout(
      id,
      workoutName,
      startDate,
      endDate
    );
    return res.status(200).json({
      status: 200,
      body: JSON.stringify(allWorkouts),
    });
  }
  return res.status(404).json({ err: MESSAGE.MESSAGE_WORKOUT_NOT_FOUND });
});
//@ts-ignore
app.post(
  "/workouts/:date/:id",
  isAuthenticated,
  async function (req: any, res) {
    try {
      const { date } = req.params;
      //const { workouts } = req.body;
      console.log(req.body);
      console.log(JSON.stringify(req.body, null, 2));
      const allWorkoutsinJson = await readWorkoutsFromDb(req.userObj.name);
      const newWorkouts = await createWorkouts(
        allWorkoutsinJson,
        date,
        req.body
      );
      if (newWorkouts) {
        await writeRecordsToDb(req.userObj.name, newWorkouts);
        return res
          .status(201)
          .json({ status: 201, body: MESSAGE.MESSAGE_SUCCESS });
      }
      return res
        .status(400)
        .json({ status: 400, body: MESSAGE.MESSAGE_INAVLID_WORKOUTS });
    } catch (ex: any) {
      console.log(ex);
      if (ex.errors) {
        return res.status(400).json(ex.errors);
      }
      return res.status(500).json(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
    }
  }
);
app.listen(3000, () => console.log("started listening"));
