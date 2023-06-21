import { Workout, WorkoutList, WorkoutSets } from "./types";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import { join } from "path";
import { isValidWorkouts } from "./validation";
export const readFilePromise = promisify(readFile);
export const writeFilePromise = promisify(writeFile);

export function getCookies(req: any) {
  const reqCookie = req.headers.cookie?.split(";");
  const cookies = reqCookie?.reduce((acc: any, el: string) => {
    const [name, value] = el.split("=");
    acc[name.trim()] = value.trim();
    return acc;
  }, {});
  return cookies || {};
}
export function parseWorkouts(
  allWorkoutsinJson: string,
  date: string,
  workoutnamesInqs?: string
) {
  let savedWorkouts: Workout = JSON.parse(allWorkoutsinJson)[date];
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
  workoutsToSave: {workouts:WorkoutSets} | Workout) {
  let allWorkoutsObj: WorkoutList = JSON.parse(allWorkoutsinJson||`""`);
  let existingWorkoutsInDB = allWorkoutsObj;
  let newWorkouts: { [key: string]: Workout };
  let completeWorkout = workoutsToSave as Workout;
  await isValidWorkouts(workoutsToSave);
  if (
    completeWorkout?.clockin &&
    completeWorkout.workouts
  ) {
    //replace{date:{}}
    newWorkouts = { ...existingWorkoutsInDB, [date]: completeWorkout };
    allWorkoutsObj = newWorkouts;
  } else {
    // workouts has been provided in sets
    let workoutsToSaveInSets = workoutsToSave.workouts as WorkoutSets;
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

export async function readWorkoutsFromDb(id: string) {
  //{date:{}}
  const filePath = `${join(__dirname, "workouts", id)}.json`;
  const emptyWorkouts = JSON.stringify({});
  try {
    const allrecords = await readFilePromise(filePath, "utf-8");
    return allrecords;
  } catch (ex: any) {
    if (ex.code === "ENOENT") {
      await writeFilePromise(filePath, emptyWorkouts);
    }
    return emptyWorkouts;
  }
}

export async function writeRecordsToDb(id: string, newWorkouts: string) {
  const filePath = `${join(__dirname, "workouts", id)}.json`;
  try {
    return await writeFilePromise(filePath, newWorkouts);
  } catch (ex) {
    throw new Error(`Unable to save the workouts`);
  }
}

export async function readStatsForWorkout(
  id: string,
  workoutname: string,
  startDate: string,
  endDate: string
) {
  // call filesystem to get the stats for a workout
  try {
    let filepath = `${join(__dirname, "workouts", id)}.json`;
    const workoutRecordInJson = await readFilePromise(filepath, "utf-8");
    const workoutRecordObj = JSON.parse(workoutRecordInJson);
    // parse workoutsrecord and find the given workoutname stats
    let dates = [];
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    let currentTime = startTime;
    while (currentTime <= endTime) {
      dates.push(new Date(currentTime).toISOString().split("T")[0]);
      currentTime += 24 * 60 * 60 * 1000;
    }
    const allWorkoutStats = dates.reduce((acc: any, el) => {
      if (workoutRecordObj[el]?.workouts[workoutname]) {
        acc.push({ [el]: workoutRecordObj[el].workouts[workoutname] });
      }
      return acc;
    }, []);
    return allWorkoutStats;
  } catch (ex) {
    console.log("No Workout Found for this user");
    return;
  }
}
