import ErrorResponse from "../ErrorResponse";

import NutritionStrategy from "./nutrtionService";
const nutritionService = new NutritionStrategy();

export async function getUsersNutrition(req: any, res) {
  const nutrition = await nutritionService.getUsersNutrition(req.user.email);
  return res.status(200).json({ success: true, data: nutrition });
}

export async function saveUsersNutrion(req: any, res) {
  const newNutritionDetails = await nutritionService.saveUsersNutrition(
    req.user.email,
    req.body
  );

  return res.status(200).json({ success: true, data: newNutritionDetails });
}

export async function getAllAvailableFoods(req, res) {
  const allFoods = await nutritionService.getAllFoodOptions();
  if (!allFoods)
    throw new ErrorResponse(`Food options not available at the moment`, 400);
  return res.status(200).json({ success: true, data: allFoods });
}
