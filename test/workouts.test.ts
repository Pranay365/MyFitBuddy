import { serviceLocator } from "../src/serviceLocator";
import WorkoutStartegy from "../src/workouts/workoutService";
describe("test for workouts list", () => {
  it("should create a new workout when no workout exists", async () => {
    let savedWorkouts,queryReceived,workoutsReceived;
    serviceLocator.register("Workout", {
      async updateOne(query,workouts,savedWorkoutsInDb) {
        queryReceived=query;
        workoutsReceived=workouts;
        savedWorkouts = savedWorkoutsInDb;
      },
    });
    const workouts = [
      { name: "bench", reps: 10, weight: 20, rest: 10, type: "weight" },
      { name: "bench", reps: 10, weight: 30, rest: 10, type: "weight" },
      { name: "running", time: 10, distance: 10, type: "cardio" },
      { name: "pushups", reps: 30, rest: 5, type: "bw" },
    ];
    const workoutStartegy = new WorkoutStartegy();
    await workoutStartegy.createWorkout(
      workouts,
      "test@test.com",
      "2023-12-28"
    );
    expect(queryReceived.date).toBe("2023-12-28");
    expect(queryReceived.email).toBe("test@test.com");
    expect(workoutsReceived["$push"].workouts["$each"]).toEqual(workouts);
  });
  it("should fetch workouts of the user by email", async () => {
    const workouts = [
      { name: "bench", reps: 10, weight: 20, rest: 10, type: "weight" },
      { name: "bench", reps: 10, weight: 30, rest: 10, type: "weight" },
    ];
    let emailPassed;
    serviceLocator.register("Workout", {
      async find({ email }) {
        emailPassed = email;
        return [{ _id: 1, workouts }];
      },
    });

    const workoutStartegy = new WorkoutStartegy();
    const fetchedWorkouts = await workoutStartegy.fetchworkouts(
      "test@test.com"
    );
    expect(emailPassed).toBe("test@test.com");
    expect(fetchedWorkouts).toEqual([{ _id: 1, workouts }]);
  });
  it("should fetch workouts by id", async () => {
    const workouts = [
      { name: "bench", reps: 10, weight: 20, rest: 10, type: "weight" },
      { name: "bench", reps: 10, weight: 30, rest: 10, type: "weight" },
    ];
    let idPassed;
    serviceLocator.register("Workout", {
      async findById(id) {
        idPassed = id;
        return { _id: 1, workouts };
      },
    });

    const workoutStartegy = new WorkoutStartegy();
    const fetchedWorkouts = await workoutStartegy.getWorkoutsByid(1);
    expect(idPassed).toBe(1);
    expect(fetchedWorkouts).toEqual({ _id: 1, workouts });
  });
});
