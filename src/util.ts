import { Workout, WorkoutList, WorkoutSets } from "./types";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import { join } from "path";

export const readFilePromise = promisify(readFile);
export const writeFilePromise = promisify(writeFile);

export function parseWorkouts(
  allWorkoutsinJson: string,
  date: string,
  workoutnamesInqs?: string
) {
  let workouts: WorkoutList = JSON.parse(allWorkoutsinJson);
  let savedWorkouts = workouts;
  if (workoutnamesInqs) {
    let workoutnames = workoutnamesInqs.split(",");
    workoutnames = workoutnames.map((name) => name.toLowerCase());
    let workouts = workoutnames.map((workoutname) => ({
      [workoutname]: savedWorkouts[date],
    }));
    return workouts;
  } else {
    return savedWorkouts[date];
  }
}
//validate workouts before saving

const validWorkouts = (workoutsToSave: WorkoutSets | Workout) => {
  if (workoutsToSave?.clockin && workoutsToSave?.workouts) {
    return true;
  } else if (Array.isArray(workoutsToSave)) {
    return workoutsToSave.every(
      (workout) => workout.reps && workout.weight && workout.time
    );
  }
  return false;
};

//1) check if the workouts exist, if yes then append else write

// prettier-ignore
export function createWorkouts( allWorkoutsinJson: string,date: string, workoutsToSave: WorkoutSets | Workout) {
  let allWorkoutsObj: WorkoutList = JSON.parse(allWorkoutsinJson);
  let existingWorkoutsInDB = allWorkoutsObj;
  let newWorkouts: { [key: string]: Workout };
  let _dirtyWorkout = workoutsToSave as Workout;
  if(!validWorkouts(workoutsToSave)){
    return;
  }
  if (
    _dirtyWorkout?.clockin &&
    _dirtyWorkout.workouts
  ) {
    //replace{date:{}}
    newWorkouts = { ...existingWorkoutsInDB, [date]: _dirtyWorkout };
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
