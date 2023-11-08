import ErrorResponse from "./ErrorResponse";
import {
  getAllFoodsFromDB,
  readNutritionFromDB,
  saveNutrionToDb,
} from "./util";

function addCaloriesToNutritionData(nutrition: any = []) {
  if (!nutrition.length) return [];
  return nutrition.map((n) => {
    let calories = n.carb * 4 + n.protein * 4 + n.fat * 8;
    return {
      carb: n.carb,
      protein: n.protein,
      fat: n.fat,
      meal: n.meal,
      date: n.date,
      calories,
    };
  });
}
export async function getUsersNutrition(req: any, res) {
  console.log("request received");
  const nutrition = await readNutritionFromDB(req.user.email);
  console.log("nutrition is nutrition", nutrition);
  const result = addCaloriesToNutritionData(nutrition);
  if (!result.length)
    throw new ErrorResponse("No nutrition details available for the user", 400);
  return res.status(200).json({ success: true, data: result });
}

export async function saveUsersNutrion(req: any, res) {
  console.log(req.body);
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
    meal: meal.map((food) => ({
      ...food,
      quantity: Number(food.quantity),
      time: currentTimeInIST,
    })),
  };
  const newNutritionDetails = await saveNutrionToDb(req.user.email, date, data);

  return res.status(200).json({ success: true, data: newNutritionDetails });
}

export async function getAllAvailableFoods(req, res) {
  const allFoods = await getAllFoodsFromDB();
  if (!allFoods)
    throw new ErrorResponse(`Food options not available at the moment`, 400);
  return res.status(200).json({ success: true, data: allFoods });
}
