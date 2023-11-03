import * as mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  foodName: String,
  quantity: Number,
  time: String,
});
const NutritionSchema = new mongoose.Schema({
  email: String,
  date: String,
  carb: Number,
  fat: Number,
  protein: Number,
  calories: Number,
  meal: [MealSchema],
});

export const Nutrition = mongoose.model("Nutrition", NutritionSchema);
