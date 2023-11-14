import { saveWorkoutsToDb, readWorkoutsFromDB, readWorkoutDetailsFromDB } from "./util";
import { Workout } from "./workout.types";
import ErrorResponse from "./ErrorResponse";

export async function createWorkout(req: any, res) {
  const { type, date } = req.body;
  console.log("type is ", type);
  let data: Workout = {} as Workout;
  if (type === "cardio") {
    const { distance, time, name } = req.body;
    if (!distance || !time || !name)
      throw new ErrorResponse(`Please provide valid entries`, 400);
    data = { distance, time, name, type };
  } else if (type === "weight") {
    const { name, reps, weight } = req.body;
    if (!name || !reps || !weight)
      throw new ErrorResponse(`Please provide valid entries`, 400);
    data = { reps, weight, name, type };
  } else if (type == "bw") {
    const { name, reps } = req.body;
    if (!name || !reps) {
      throw new ErrorResponse(`Please provide valid entries`, 400);
    }
    data = { reps, name, type };
  }
  const newWorkouts = await saveWorkoutsToDb(req.user.email, date, data);
  return res.status(200).send(newWorkouts);
}

export async function getWorkouts(req, res, next) {
  const allWorkouts = await readWorkoutsFromDB(req.user.email);
  if (!allWorkouts) throw new ErrorResponse(`Workouts not found in DB`, 404);
  return res.status(200).json({ success: true, data: allWorkouts });
}

export async function getWorkoutById(req,res){
  const workoutDetails=await readWorkoutDetailsFromDB(req.params.id);
  console.log(workoutDetails);
  if(!workoutDetails) throw new ErrorResponse(`Workout not found`,404);
  return res.status(200).json({success:true,data:workoutDetails});
}