import { readFile, writeFile, mkdir } from "fs";
import { promisify } from "util";
import { join } from "path";
import { User } from "./models/user";
import { isValidUser, isValidWorkouts } from "./validation";
import { v4 } from "uuid";
import { hash } from "bcryptjs";
import { srcDir } from "./config";
import { Workout } from "./models/workout";
import { WorkoutSession } from "./workout.types";
import { Foods } from "./models/foods";
import { Nutrition } from "./models/nutrition";
import { Stats } from "./models/stats";
import ErrorResponse from "./ErrorResponse";
export const readFilePromise = promisify(readFile);
export const writeFilePromise = promisify(writeFile);
export const mkdirPromise = promisify(mkdir);
export async function getHealthStats(email: string) {
  const healthStatsForUser = await Stats.findOne({ email });
  return healthStatsForUser || {};
}

export async function register(
  username: string,
  password: string,
  confirmPassword: string,
  email: string,
  first_name: string,
  last_name: string,
  avatar: Buffer | undefined
) {
  await isValidUser({ username, password, confirmPassword });
  const hashedPassword = await hash(password, 8);
  const registrationId = v4();
  const date = new Date();
  const filePath = `${join(srcDir, "users")}.json`;
  const userDir = `${join(srcDir, username)}`;
  const statsPath = `${join(userDir, "stats")}.json`;
  const nutritionPath = `${join(userDir, "nutrition")}.json`;
  const workoutsPath = `${join(userDir, "workouts")}.json`;
  const usrObj = {
    [username]: {
      registrationId,
      hashedPassword,
      createdAt: date.toISOString(),
      email,
      first_name,
      last_name,
      avatar,
    },
  };
  const existingUsersInJson =
    (await readFilePromise(filePath, "utf-8")) || JSON.stringify({});
  let existingUsers = JSON.parse(existingUsersInJson);
  existingUsers = { ...existingUsers, ...usrObj };
  await writeFilePromise(filePath, JSON.stringify(existingUsers));
  await mkdirPromise(userDir);
  await writeFilePromise(statsPath, JSON.stringify({}));
  await writeFilePromise(nutritionPath, JSON.stringify([]));
  await writeFilePromise(workoutsPath, JSON.stringify([]));
  return registrationId;
}
export async function getUserProfile(username) {
  const profileJSON = await readFilePromise(
    `${join(srcDir, "users")}.json`,
    "utf-8"
  );
  const profile = JSON.parse(profileJSON);
  console.log(profile[username], username);
  return profile[username]?.avatar
    ? Buffer.from(profile[username]?.avatar)
    : undefined;
}
export async function getUserfromDB(userid: string) {
  let user = await User.findById(userid);
  if (!user) throw new Error("User not found");
  return user;
}
// export async function getUserSession(userid: string) {
//   const user = await User.findById(userid);
//   if (!user) throw new Error("User not found");
//   return user.session;
// }

// export async function removeUserSession(userid: string) {
//   const newUser = await User.findByIdAndUpdate(userid, { session: undefined });
//   if (!newUser) throw new Error(`Unable to update`);
//   return newUser;
// }
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
export function parseWorkouts(
  allWorkoutsinJson: string,
  date: string,
  workoutnamesInqs?: string
) {
  let savedWorkouts = JSON.parse(allWorkoutsinJson)[date];
  if (workoutnamesInqs) {
    let workoutnames = workoutnamesInqs.split(",");
    let workouts = workoutnames
      .map((name) => savedWorkouts?.workouts[name.toLocaleLowerCase()])
      .filter((workout) => workout);
    return workouts;
  } else {
    return savedWorkouts?.workouts;
  }
}

//1) check if the workouts exist, if yes then append else write

// prettier-ignore
export async function createWorkouts( 
  allWorkoutsinJson: string,
  date: string,
  workoutsToSave:any) {
  let allWorkoutsObj = JSON.parse(allWorkoutsinJson||`""`);
  let existingWorkoutsInDB = allWorkoutsObj;
  let newWorkouts;
  //@ts-ignore
  let completeWorkout = workoutsToSave as Workout;
  await isValidWorkouts(workoutsToSave);
  if (
    //@ts-ignore
    completeWorkout?.clockin && completeWorkout.workouts
  ) {
    //replace{date:{}}
    newWorkouts = { ...existingWorkoutsInDB, [date]: completeWorkout };
    allWorkoutsObj = newWorkouts;
  } else {
    // workouts has been provided in sets
    //@ts-ignore
    let workoutsToSaveInSets = workoutsToSave.workouts;
    Object.keys(workoutsToSave.workouts).forEach((workoutName) => {
      existingWorkoutsInDB[date].workouts[workoutName] = existingWorkoutsInDB[date].workouts[workoutName] || [];
      existingWorkoutsInDB[date].workouts[workoutName] = [ ...existingWorkoutsInDB[date].workouts[workoutName],...workoutsToSaveInSets[workoutName],
      ];
    });
    allWorkoutsObj = existingWorkoutsInDB;
  }
  // allStatsObj.workouts[date].workouts = [...allStatsObj.workouts[date].workouts, ...workoutsToSave];
  return JSON.stringify(allWorkoutsObj);
}

export async function getAllFoodsFromDB() {
  const allFoods = await Foods.find({});
  return allFoods;
}
export async function readWorkoutsFromDB(email: string) {
  const workouts = await Workout.find({ email });
  return workouts;
}
export async function readNutritionFromDB(email: string) {
  const nutrition = await Nutrition.find({ email });
  return nutrition;
}
export async function saveNutrionToDb(email: string, inputDate: string, data) {
  let nutritionToSave: any = {
    date: inputDate,
    email,
    meal: [],
  };
  let nutrition: any = await Nutrition.findOne({ email, date: inputDate });
  if (!nutrition) {
    nutritionToSave.carb = Math.round(data.carb);
    nutritionToSave.protein = Math.round(data.protein);
    nutritionToSave.fat = Math.round(data.fat);
    nutritionToSave.meal = data.meal;
    const savedData = await Nutrition.create(nutritionToSave);
    return savedData;
  } else {
    nutrition.carb += Math.round(data.carb);
    nutrition.protein += Math.round(data.protein);
    nutrition.fat += Math.round(data.fat);
    const savedNutrition = await Nutrition.findByIdAndUpdate(
      nutrition._id,
      {
        $push: {
          meal: data.meal,
        },
        $set: {
          carb: nutrition.carb,
          protein: nutrition.protein,
          fat: nutrition.fat,
        },
      },
      {
        new: true,
      }
    );
    return savedNutrition;
  }
}
export async function saveWorkoutsToDb(email: string, inputDate: string, data) {
  // 1 read the date of the workout
  const currentDate = new Date().toISOString().split("T")[0];
  let workoutToSave: any = {
    date: currentDate,
    email: "",
    clockin: "",
    clockout: "",
    workouts: [],
  };
  let workout: any = await Workout.findOne({ email, date: inputDate });
  if (!workout) {
    // no existing workout in db
    workoutToSave.date = currentDate;
    workoutToSave.email = email;
    workoutToSave.clockin = new Date().toISOString();
    workoutToSave.clockout = new Date().toISOString();
    workoutToSave.workouts = [
      {
        name: data.name,
        reps: data.reps,
        weight: data.weight,
        type: data.type,
      },
    ];
    const newWorkouts = await Workout.create(workoutToSave);
    return newWorkouts;
  } else {
    // existing workout in db
    workoutToSave.clockout = new Date().toISOString();
    workoutToSave.workouts = {
      reps: data.reps,
      weight: data.weight,
      name: data.name,
      type: data.type,
    };
    const newWorkouts = await Workout.findByIdAndUpdate(
      workout._id,
      {
        $set: {
          clockout: workoutToSave.clockout,
        },
        $push: {
          workouts: workoutToSave.workouts,
        },
      },
      {
        new: true,
      }
    );
    return newWorkouts;
  }
}

function calculateCaloriesFromQty(calPer100, quantity) {
  return (calPer100 / 100) * quantity;
}

export async function saveSettings(
  email: string,
  heartbeat: number,
  maintain_cal: number,
  sleep: number
) {
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
