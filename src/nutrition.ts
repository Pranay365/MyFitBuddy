import ErrorResponse from "./ErrorResponse";
import {
  getAllFoodsFromDB,
  readNutritionFromDB,
  saveNutrionToDb,
} from "./util";

export async function getUsersNutrition(req: any, res) {
  console.log("request received");
  const nutrition = await readNutritionFromDB(req.user.email);
  if (!nutrition)
    throw new ErrorResponse("No nutrition details available for the user", 400);
  return res.status(200).json({ success: true, data: nutrition });
}

export async function saveUsersNutrion(req: any, res) {
  const { date, fat, protein, carb, meal } = req.body;
  const currentTimeInIST = new Date()
    .toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
    .split(",")[1];
  const data = {
    fat,
    protein,
    carb,
    meal: meal.map((food) => ({ ...food, time: currentTimeInIST })),
  };
  const newNutritionDetails = await saveNutrionToDb(req.user.email, date, data);
  return res.status(200).send(newNutritionDetails);
}

export async function getAllAvailableFoods(req, res) {
  const allFoods = await getAllFoodsFromDB();
  if (!allFoods)
    throw new ErrorResponse(`Food options not available at the moment`, 400);
  return res.status(200).send(allFoods);
}
