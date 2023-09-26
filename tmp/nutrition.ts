import { getAllFoodsFromDB, readDataFromDb, saveNutritionDetailsToDB } from "./util";

export async function getNutrition(req: any, res) {
  console.log("request received");
  // 1. Read userid from cookies
  const username = req.user.email.split("@")[0];
  // 1. Get workouts from userid folder
  const nutrition = await readDataFromDb(username, "nutrition");
  // 2. Send the workouts to ui
  res.status(200).send(nutrition);
}

export async function saveUsersNutrion(req: any, res){
  const username = req.user.email.split("@")[0];
  const newNutritionDetails = await saveNutritionDetailsToDB(
    username,
    req.body
  );
  return res.status(200).send(newNutritionDetails);
}

export async function getAllAvailableFoods(req, res) {
  try {
    const allFoods = await getAllFoodsFromDB();
    return res.status(200).send(allFoods);
  } catch (ex) {
    console.log(ex);
    res.status(500).send("Internal Server Error");
  }
}
