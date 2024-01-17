import axios from "axios";
import ErrorResponse from "../ErrorResponse";
import * as db from "../db";
export default class NutritionStrategy {
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
    return nutrition.map(async (n) => {
      // let calories = n.carb * 4 + n.protein * 4 + n.fat * 8;
      // return {
      //   carb: n.carb,
      //   protein: n.protein,
      //   fat: n.fat,
      //   meal: n.meal,
      //   date: n.date,
      //   calories,
      // };
      console.log(JSON.stringify(n.meal, null, 2));
      let foodDetailsPromise = n.meal.map(async (meal) =>
        axios.get(
          `${process.env.EDAMAN_URI}?app_id=${process.env.APP_ID}&app_key=${
            process.env.APP_KEY
          }&ingr=${encodeURIComponent(meal.quantity + "g " + meal.foodName)}`
        )
      );
      const foodDetails = await Promise.all(foodDetailsPromise);
      let calories = foodDetails.reduce((cal, food) => {
        cal += food.data?.totalNutrients.ENERC_KCAL.quantity || 0;
        return cal;
      }, 0);
      // review what needs to be stored and sent
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
    const { date, meal } = nutritionInfo;
    if (!Array.isArray(meal))
      throw new ErrorResponse("Not a valid meal. Meal should be an array", 400);
    const currentTimeInIST = new Date()
      .toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
      .split(",")[1];
    const foodPromise = meal.map((foodItem) =>
      axios.get(
        `${process.env.EDAMAN_URI}?app_id=${process.env.APP_ID}&app_key=${
          process.env.APP_KEY
        }&ingr=${encodeURIComponent(
          foodItem.quantity + "g " + foodItem.foodName
        )}`
      )
    );
    const foodDetails = await Promise.all(foodPromise);
    const macros = foodDetails.reduce(
      (macros, macro) => {
        macros.fat += macro.data.totalNutrients.FAT.quantity;
        macros.protein += macro.data.totalNutrients.PROCNT.quantity;
        macros.carb += macro.data.totalNutrients.CHOCDF.net.quantity;
        return macros;
      },
      { fat: 0, carb: 0, protein: 0 }
    );
    const data = {
      fat: macros.fat,
      protein: macros.protein,
      carb: macros.carb,
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
    return nutritionInfo;
  }
  async getAllFoodOptions() {
    const allFoods = await db.execute("Foods", "find", [{}]);
    const allFoodsPromise=allFoods.map(async function (foodItem) {
      const foodDetails = await axios.get(
        `${process.env.EDAMAN_URI}?app_id=${process.env.APP_ID}&app_key=${
          process.env.APP_KEY
        }&ingr=${encodeURIComponent(1 + "g " + foodItem.name)}`
      );
      return {
        _id: foodItem._id,
        name: foodItem.name,
        carb: foodDetails.data.totalNutrients.CHOCDF.net.quantity,
        fat: foodDetails.data.totalNutrients.FAT.quantity,
        protein: foodDetails.data.totalNutrients.PROCNT.quantity,
      };
    });
    let allFoodsWDetails=Promise.all(allFoodsPromise);
    return allFoodsWDetails;
  }
}
