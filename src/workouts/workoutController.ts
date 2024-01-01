import WorkoutService from "./workoutService";
const workoutService = new WorkoutService();

export async function createWorkout(req: any, res) {
  const newWorkouts = workoutService.createWorkout(
    req.body.workouts,
    req.user.email,
    req.body.date
  );
  return res.status(200).send(newWorkouts);
}

export async function getWorkouts(req, res, next) {
  const allWorkouts = await workoutService.fetchworkouts(req.user.email);
  return res.status(200).json({ success: true, data: allWorkouts });
}

export async function getWorkoutById(req, res) {
  const workoutDetails = await workoutService.getWorkoutsByid(req.params.id);
  return res.status(200).json({ success: true, data: workoutDetails });
}
