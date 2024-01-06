import ErrorResponse from "../ErrorResponse";
import * as db from "../db";
export default class NutritionStrategy {
  constructor() {}
  async getUsersNutrition(email) {
    console.log("request received");
    const nutrition = await this.readNutritionFromDB(email);
    console.log("nutrition is nutrition", nutrition);
    const result = this.addCaloriesToNutritionData(nutrition);
    if (!result.length)
      throw new ErrorResponse(
        "No nutrition details available for the user",
        400
      );
    return result;
  }
  addCaloriesToNutritionData(nutrition: any = []) {
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
  async saveUsersNutrition(email, nutritionInfo) {
    const { date, fat, protein, carb, meal } = nutritionInfo;
    if (!Array.isArray(meal))
      throw new ErrorResponse("Not a valid meal. Meal should be an array", 400);
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
    return this.saveNutrionToDb(email, date, data);
  }
  async readNutritionFromDB(email: string) {
    const nutrition = await db.execute("Nutrition", "find", [{ email }]);
    return nutrition;
  }
  async saveNutrionToDb(email: string, inputDate: string, data) {
    let nutritionInfo = await db.execute("Nutrition", "updateOne", [
      { email, date: inputDate },
      {
        $inc: { carb: data.carb, fat: data.fat, protein: data.protein },
        $set: { email, date: inputDate },
        $push: { meal: data.meal },
      },
      { upsert: true, new: true },
    ]);
    // let nutrition: any = await db.execute("Nutrition", "findOne", [
    //   { email, date: inputDate },
    // ]);

    // if (!nutrition) {
    //   nutritionToSave.carb = Math.round(data.carb);
    //   nutritionToSave.protein = Math.round(data.protein);
    //   nutritionToSave.fat = Math.round(data.fat);
    //   nutritionToSave.meal = data.meal;
    //   const savedData = await db.execute("Nutrition", "create", [
    //     nutritionToSave,
    //   ]);
    //   return savedData;
    // } else {
    //   nutrition.carb += Math.round(data.carb);
    //   nutrition.protein += Math.round(data.protein);
    //   nutrition.fat += Math.round(data.fat);
    //   const savedNutrition = await db.execute(
    //     "Nutrition",
    //     "findByIdAndUpdate",
    //     [
    //       nutrition._id,
    //       {
    //         $push: {
    //           meal: data.meal,
    //         },
    //         $set: {
    //           carb: nutrition.carb,
    //           protein: nutrition.protein,
    //           fat: nutrition.fat,
    //         },
    //       },
    //       {
    //         new: true,
    //       },
    //     ]
    //   );
    //   return savedNutrition;
    // }
    return nutritionInfo;
  }
  async getAllFoodOptions() {
    const allFoods = await db.execute("Foods", "find", [{}]);
    return allFoods;
  }
}
