import { v4 } from "uuid";
import { readDataFromDb, saveWorkoutsToDb } from "./util";
import { Workout } from "./workout.types";
import { MESSAGE } from "./constants";

export async function getWorkouts(req: any, res: any) {
  try {
    console.log("request received");
    const username = req.user.email.split("@")[0];
    // 1. Get workouts from userid folder
    const workouts = await readDataFromDb(username, "workouts");
    // 2. Send the workouts to ui
    return res.status(200).send(workouts);
    // 3. End
  } catch (ex) {
    console.log(ex);
    res.status(500).send("Something went wrong in the server");
  }
}

export async function createWorkout(req: any, res) {
  try {
    const { type } = req.body;
    console.log("type is ",type);
    const id = v4();
    let data: Workout = {} as Workout;
    if (type === "cardio") {
      const { distance, time, name } = req.body;
      if (!distance || !time || !name)
        return res.status(400).json(MESSAGE.MESSAGE_INAVLID_WORKOUTS);
      data = { distance, time, name,type };
    } else if (type === "weight") {
      const { name, reps, weight } = req.body;
      if (!name || !reps || !weight)
        return res.status(400).json(MESSAGE.MESSAGE_INAVLID_WORKOUTS);
      data = { reps, weight, name ,type};
    } else if (type == "bw") {
      const { name, reps } = req.body;
      if (!name || !reps) {
        return res.status(400).json(MESSAGE.MESSAGE_INAVLID_WORKOUTS);
      }
      data = { reps, name,type };
    }

    const username = req.user.email.split("@")[0];
    const newWorkouts = saveWorkoutsToDb(username, data);
    return res.status(200).send(newWorkouts);
  } catch (ex) {
    console.log(ex);
    return res.status(500).json("Something went wrong in the server");
  }
}
