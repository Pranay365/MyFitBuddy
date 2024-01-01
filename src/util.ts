import { serviceLocator } from "./serviceLocator";
import * as db from "./db";
export async function getHealthStats(email: string) {
  const healthStatsForUser = await db.findOne("User",{ email });
  return healthStatsForUser || {};
}

export function getCookies(req: any) {
  const reqCookie = req.headers.cookie?.split(";");
  const cookies = reqCookie?.reduce((acc: any, el: string) => {
    const [name, value] = el.split("=");
    acc[name.trim()] = value.trim();
    return acc;
  }, {});
  console.log(cookies);
  return cookies || {};
}

//1) check if the workouts exist, if yes then append else write

// prettier-ignore

export async function getAllFoodsFromDB() {
  const Foods=serviceLocator.get("Foods");
  const allFoods = await Foods.find({});
  return allFoods;
}

export async function saveWorkoutsToDb(email: string, inputDate: string, data) {
  // 1 read the date of the workout
  let workoutToSave: any = {
    date: inputDate,
    email: "",
    clockin: "",
    clockout: "",
    workouts: [],
  };
  const Workout = serviceLocator.get("Workout");
  let workout: any = await Workout.findOne({ email, date: inputDate });
  if (!workout) {
    // no existing workout in db
    workoutToSave.date = inputDate;
    workoutToSave.email = email;
    workoutToSave.clockin = new Date(inputDate).toISOString();
    workoutToSave.clockout = new Date(inputDate).toISOString();
    workoutToSave.workouts = data;
    console.log(workoutToSave);
    const newWorkouts = await Workout.create(workoutToSave);
    return newWorkouts;
  } else {
    // existing workout in db
    workoutToSave.clockout = new Date().toISOString();
    const newWorkouts = await Workout.findByIdAndUpdate(
      workout._id,
      {
        $set: {
          clockout: workoutToSave.clockout,
        },
        $push: {
          workouts: data,
        },
      },
      {
        new: true,
      }
    );
    return newWorkouts;
  }
}

export async function saveSettings(
  email: string,
  heartbeat: number,
  maintain_cal: number,
  sleep: number
) {
  const Stats = serviceLocator.get("Stats");
  const existingSettings = await Stats.findOne({ email });
  if (!existingSettings) {
    const savedSettings = await Stats.create({
      email,
      heartbeat,
      maintain_cal,
      sleep,
    });
    return savedSettings;
  } else {
    const newSettings = { email, heartbeat, maintain_cal, sleep };
    const savedSettings = await Stats.findByIdAndUpdate(
      existingSettings._id,
      newSettings
    );
    return savedSettings;
  }
}
