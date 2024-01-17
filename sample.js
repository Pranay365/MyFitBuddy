const apiKey = "YOUR_EDAMAM_API_KEY";
const appId = "YOUR_EDAMAM_APP_ID";
const foodName = "butter chicken"; // Replace with the Indian dish you want to search for
const quantity = 1; // Replace with the desired quantity

const apiUrl = `https://api.edamam.com/api/nutrition-data?app_id=${appId}&app_key=${apiKey}&ingr=${quantity} ${encodeURIComponent(
  foodName
)}`;

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    if (data.parsed.length > 0) {
      const calories = data.parsed[0].food.nutrients.ENERC_KCAL;
      console.log(`Calories in ${quantity} ${foodName}: ${calories} kcal`);
    } else {
      console.log(
        `Nutritional information not found for ${quantity} ${foodName}`
      );
    }
  })
  .catch((error) => console.error("Error fetching data:", error));
