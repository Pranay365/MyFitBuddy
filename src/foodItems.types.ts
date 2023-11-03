type FoodItem = {
  id: number;
  name: string;
  category: "carb" | "protein"; // Possible categories
  protein: number;
  carbohydrates: number;
  fat: number;
};

const foodItems: FoodItem[] = [
  {
    id: 1,
    name: "Quaker Oats",
    category: "carb",
    protein: 10,
    carbohydrates: 30,
    fat: 40,
  },
  {
    id: 2,
    name: "whey protein",
    category: "protein",
    protein: 25,
    carbohydrates: 0,
    fat: 0,
  },
  {
    id: 3,
    name: "Egg",
    category: "protein",
    protein: 6,
    carbohydrates: 0,
    fat: 2,
  },
  {
    id: 4,
    name: "egg whites",
    category: "protein",
    protein: 4,
    carbohydrates: 0,
    fat: 0,
  },
  {
    id: 5,
    name: "sweet potato",
    category: "carb",
    protein: 2,
    carbohydrates: 30,
    fat: 10,
  },
];
