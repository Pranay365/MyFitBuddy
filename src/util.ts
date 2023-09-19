import { readFile, writeFile,mkdir } from "fs";
import { promisify } from "util";
import { join } from "path";
import { isValidUser, isValidWorkouts } from "./validation";
import { Workout } from "./workout.types";
import { v4 } from "uuid";
import { hash } from "bcryptjs";
export const readFilePromise = promisify(readFile);
export const writeFilePromise = promisify(writeFile);
export const mkdirPromise=promisify(mkdir);
export async function getHealthStats(username:string){
  const filePath=`${join(__dirname,username,"stats")}.json`;
  const healthStats=await readFilePromise(filePath,"utf-8")||"``";
  return JSON.parse(healthStats);
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
  const filePath = `${join(__dirname, "users")}.json`;
  const userDir = `${join(__dirname, username)}`;
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
    `${join(__dirname, "users")}.json`,
    "utf-8"
  );
  const profile = JSON.parse(profileJSON);
  console.log(profile[username], username);
  return profile[username]?.avatar
    ? Buffer.from(profile[username]?.avatar)
    : undefined;
}
export async function getUserfromDB(username: string) {
  try {
    const filePath = `${join(__dirname, "users")}.json`;
    const userObjInJson = await readFilePromise(filePath, "utf-8");
    const userObj = JSON.parse(userObjInJson);
    return userObj[username];
  } catch (ex: any) {
    return;
  }
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

export async function readDataFromDb(id: string, type: string) {
  //{date:{}}
  const filePath = `${join(__dirname, id, type)}.json`;
  const emptyData = JSON.stringify({});
  try {
    const allrecords = await readFilePromise(filePath, "utf-8");
    return allrecords;
  } catch (ex: any) {
    if (ex.code === "ENOENT") {
      await writeFilePromise(filePath, emptyData);
    }
    return emptyData;
  }
}
export async function getAllFoodsFromDB() {
  const filePath = `${join(__dirname, "data", "foods")}.json`;
  const allFoods = await readFilePromise(filePath, "utf-8");
  return allFoods;
}

export async function saveNutrionToDb(id: string, data) {
  //1. read all nutrition details for this id
  //2. if nutrion exists add to current date
  //3. else create a new entry for todays date and add carb,fat,protein and cal to it
  //3. save the details to db.
  const filePath = `${join(__dirname, id, "nutrition")}.json`;
  await writeFilePromise(filePath, data);
  const allNutrition = await readFilePromise(filePath, "utf-8");
  return allNutrition;
}
export async function saveWorkoutsToDb(id: string, data: Workout) {
  let dataToSave = {};
  const filePath = `${join(__dirname, id, "workouts")}.json`;
  try {
    const existingDataInDB = await readFilePromise(filePath, "utf-8");
    let existingWorkouts = JSON.parse(existingDataInDB);
    if (existingDataInDB) {
      const todaysWorkout = existingWorkouts?.find(
        (w) => w.date == new Date().toISOString().split("T")[0]
      );
      if (todaysWorkout) {
        dataToSave = {
          ...todaysWorkout,
          clockout: getFormattedTime(),
          workouts: [...todaysWorkout.workouts, data],
        };
        existingWorkouts = existingWorkouts.filter(
          (w) => w.date !== new Date().toISOString().split("T")[0]
        );
      } else {
        dataToSave = {
          clockin: getFormattedTime(),
          clockout: getFormattedTime(),
          date: new Date().toISOString().split("T")[0],
          workouts: [data],
        };
        console.log(dataToSave);
      }
    } else {
      dataToSave = {
        clockin: new Date().toISOString().split("T")[1].split("Z")[0],
        clockout: new Date().toISOString().split("T")[1].split("Z")[0],
        date: new Date().toISOString().split("T")[0],
        workouts: [data],
      };
    }
    await writeFilePromise(
      filePath,
      JSON.stringify([...existingWorkouts, dataToSave])
    );
    const newWorkouts = await readDataFromDb(id, "workouts");
    return newWorkouts;
  } catch (ex: any) {
    if (ex.code === "ENOENT") {
      await writeFilePromise(filePath, `""`);
    }
  }
}
function getTodaysDate() {
  return new Date().toISOString().split("T")[0];
}

async function getFoodDetails(foodName: string) {
  const allFoods = JSON.parse(await getAllFoodsFromDB());
  return allFoods.find((food) => food.name === foodName);
}

function calculateCaloriesFromQty(calPer100, quantity) {
  return (calPer100 / 100) * quantity;
}
export async function saveNutritionDetailsToDB(
  id: string,
  rawNutrionData: any
) {
  const filePath = `${join(__dirname, id, "nutrition")}.json`;

  try {
    const existingDataInDB = await readFilePromise(filePath, "utf-8");
    let allentries = JSON.parse(existingDataInDB) || [];
    let todaysNutrition =
      allentries.find((entry) => entry.date === getTodaysDate()) || {};
    await Promise.all(
      rawNutrionData.map(async ({ id, foodName, quantity }) => {
        const foodData = await getFoodDetails(foodName);
        const {
          carbohydrates: carbPer100,
          fat: fatPer100,
          protein: proteinPer100,
        } = foodData;
        const carbInFood = calculateCaloriesFromQty(carbPer100, quantity);
        const fatInFood = calculateCaloriesFromQty(fatPer100, quantity);
        const proteinInFood = calculateCaloriesFromQty(proteinPer100, quantity);
        const totalCal = carbInFood + proteinInFood + fatInFood;
        todaysNutrition.id = todaysNutrition.id || id;
        todaysNutrition.date = todaysNutrition.date || getTodaysDate();
        todaysNutrition.carb = (todaysNutrition.carb || 0) + carbInFood;
        todaysNutrition.fat = (todaysNutrition.fat || 0) + fatInFood;
        todaysNutrition.protein =
          (todaysNutrition.protein || 0) + proteinInFood;
        todaysNutrition.calories = (todaysNutrition.calories || 0) + totalCal;
        todaysNutrition.nutrition = !todaysNutrition.nutrition
          ? [{ foodName, quantity }]
          : [...todaysNutrition.nutrition, { foodName, quantity }];
      })
    );
    allentries = allentries.filter((entry) => entry.date !== getTodaysDate());
    allentries = [...allentries, todaysNutrition];
    await writeFilePromise(filePath, JSON.stringify(allentries));
    const newNutritionDetails = await readFilePromise(filePath, "utf-8");
    return newNutritionDetails;
  } catch (ex) {
    console.log(ex);
  }
}
export async function saveSettings(username:string,heartbeat:number,maintenance_cal:number,sleep:number){
    const filepath=`${join(__dirname,username,"stats")}.json`;
    const allSettingsJSON=await readFilePromise(filepath,"utf-8");
    const allSettings=JSON.parse(allSettingsJSON);
    const newSettings={...allSettings,heartbeat,sleep,maintenance_cal};
    await writeFilePromise(filepath,JSON.stringify(newSettings));
    return newSettings;
}
export async function writeRecordsToDb(id: string, newWorkouts: string) {
  const filePath = `${join(__dirname, "workouts", id)}.json`;
  try {
    return await writeFilePromise(filePath, newWorkouts);
  } catch (ex) {
    throw new Error(`Unable to save the workouts`);
  }
}

function getFormattedTime() {
  let time = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(
    new Date().toISOString()
  )!;
  return time[2];
}
// export async function readStatsForWorkout(
//   id: string,
//   workoutname: string,
//   startDate: string,
//   endDate: string
// ) {
//   // call filesystem to get the stats for a workout
//   try {
//     let filepath = `${join(__dirname, "workouts", id)}.json`;
//     const workoutRecordInJson = await readFilePromise(filepath, "utf-8");
//     const workoutRecordObj = JSON.parse(workoutRecordInJson);
//     // parse workoutsrecord and find the given workoutname stats
//     let dates = [];
//     const startTime = new Date(startDate).getTime();
//     const endTime = new Date(endDate).getTime();
//     let currentTime = startTime;
//     while (currentTime <= endTime) {
//       dates.push(new Date(currentTime).toISOString().split("T")[0]);
//       currentTime += 24 * 60 * 60 * 1000;
//     }
//     const allWorkoutStats = dates.reduce((acc: any, el) => {
//       if (workoutRecordObj[el]?.workouts[workoutname]) {
//         acc.push({ [el]: workoutRecordObj[el].workouts[workoutname] });
//       }
//       return acc;
//     }, []);
//     return allWorkoutStats;
//   } catch (ex) {
//     console.log("No Workout Found for this user");
//     return;
//   }
// }
