import mongoose from "mongoose";
import * as db from "../db";
import { connectDb } from "../middleware/connectDb";
import { Foods } from "../models/foods";
import { serviceLocator } from "../serviceLocator";
require("dotenv").config();
async function upload() {
  let con = await mongoose.connect(process.env.CON_STRING!);
  const foods = [
    {
      name: "dates",
      category: "sugar",
    },
    {
      name: "rice",
      category: "carb",
    },
    {
      name: "chicken",
      category: "protein",
    },
  ];
  serviceLocator.register("Foods", Foods);
  await Promise.all(
    foods.map(async (foodItem) => {
      await db.execute("Foods", "create", [foodItem]);
    })
  );
}
upload();
