import * as mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: String,
  category: String,
  calories: Number,
  protein: Number,
  fat: Number,
  carb: Number,
});

export const Foods = mongoose.model("Foods", foodSchema);
