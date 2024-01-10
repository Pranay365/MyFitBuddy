import ErrorResponse from "../ErrorResponse";
import * as db from "../db";
export default class WorkoutStartegy {
  fields;
  constructor() {
    this.fields = {
      weight: ["name", "reps", "weight", "rest", "type"],
      bw: ["name", "reps", "rest", "type"],
      cardio: ["name", "distance", "time", "type"],
    };
  }
  async createWorkout(workouts, email, date) {
    const data = workouts.map((workout) => {
      const fields = this.fields[workout.type];
      let temp = {};
      fields.forEach((field) => {
        if (workout[field] == null || workout[field] == undefined)
          throw new ErrorResponse(
            `Expected ${field} but not provided in the input`,
            400
          );
        temp[field] = workout[field];
      });
      return temp;
    });
    const newWorkouts = await this.saveWorkoutsToDb(email, date, data);
    return newWorkouts;
  }
  async fetchworkouts(email) {
    const allWorkouts = await this.readWorkoutsFromDB(email);
    if (!allWorkouts) throw new ErrorResponse(`Workouts not found in DB`, 404);
    return allWorkouts;
  }
  async getWorkoutsByid(id) {
    const workoutDetails = await this.readWorkoutDetailsFromDB(id);
    console.log(workoutDetails);
    if (!workoutDetails) throw new ErrorResponse(`Workout not found`, 404);
    return workoutDetails;
  }
  async saveWorkoutsToDb(email: string, inputDate: string, data) {
    const saved_workout = await db.execute("Workout", "updateOne", [
      { email, date: inputDate },
      {
        $set: { email, date: inputDate, clockout: new Date().toISOString() },
        $push: { workouts: { $each: data } },
        $setOnInsert: { clockin: new Date().toISOString() },
      },
      { upsert: true, new: true },
    ]);
    console.log(saved_workout);
    return saved_workout;
    // let workout: any = await db.execute("Workout", "findOne", [
    //   { email, date: inputDate },
    // ]);
    // if (!workout) {
    //   // no existing workout in db
    //   workoutToSave.date = inputDate;
    //   workoutToSave.email = email;
    //   workoutToSave.clockin = new Date(inputDate).toISOString();
    //   workoutToSave.clockout = new Date(inputDate).toISOString();
    //   workoutToSave.workouts = data;
    //   console.log(workoutToSave);
    //   const newWorkouts = await db.execute("Workout", "create", [workoutToSave]);
    //   return newWorkouts;
    // } else {
    //   // existing workout in db
    //   workoutToSave.clockout = new Date().toISOString();
    //   const newWorkouts = await db.execute("Workout", "findByIdAndUpdate", [
    //     workout._id,
    //     {
    //       $set: {
    //         clockout: workoutToSave.clockout,
    //       },
    //       $push: {
    //         workouts: data,
    //       },
    //     },
    //     {
    //       new: true,
    //     },
    //   ]);
    //   return newWorkouts;
    // }
  }
  async readWorkoutDetailsFromDB(id: string) {
    const workout = await db.execute("Workout", "findById", [id]);
    return workout;
  }
  async readWorkoutsFromDB(email: string) {
    const workouts = await db.execute("Workout", "find", [{ email }]);
    return workouts;
  }
}
