import { Workout, WorkoutList, WorkoutSets } from "./types";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import { join } from "path";
import { ApplicationError } from "./Error";
import { isValidWorkouts } from "./validation";

import { MESSAGE } from "./constants";
export const readFilePromise = promisify(readFile);
export const writeFilePromise = promisify(writeFile);

export function parseWorkouts(
  allWorkoutsinJson: string,
  date: string,
  workoutnamesInqs?: string
) {
  try {
    let savedWorkouts: Workout = JSON.parse(allWorkoutsinJson)[date];
    if (workoutnamesInqs) {
      let workoutnames = workoutnamesInqs.split(",");
      let workouts = workoutnames.map((name) => savedWorkouts.workouts[name]);
      return workouts;
    } else {
      return savedWorkouts.workouts;
    }
  } catch (ex: any) {
    if (ex.message.includes("JSON")) {
      return new ApplicationError(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR, 500);
    }
  }
}

//1) check if the workouts exist, if yes then append else write

// prettier-ignore
export async function createWorkouts( allWorkoutsinJson: string,date: string, workoutsToSave: WorkoutSets | Workout) {
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
    // add to workouts array
    //workoutToSave={squats:[],deadLift:[]}
    let workoutsToSaveInSets = workoutsToSave as WorkoutSets;
    Object.keys(workoutsToSave).forEach((workoutName) => {
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
