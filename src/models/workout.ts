import * as mongoose from "mongoose";

const setSchema = new mongoose.Schema({
  reps: Number,
  weight: Number,
  type:String,
  name: String,
});
const WorkoutSchema = new mongoose.Schema({
  email:String,
  clockin: String,
  clockout: String,
  date: String,
  workouts: [setSchema],
});

export const Workout = mongoose.model("Workout", WorkoutSchema);
