import { serviceLocator } from "../src/serviceLocator";
import WorkoutStartegy from "../src/workouts/workoutService";
describe("test for workouts list", () => {
  it("should create a new workout when no workout exists", async () => {
    let savedWorkouts;
    serviceLocator.register("Workout", {
      async findOne() {
        return;
      },
      async create(savedWorkoutsInDb) {
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
    expect(savedWorkouts.date).toBe("2023-12-28");
    expect(savedWorkouts.email).toBe("test@test.com");
    expect(savedWorkouts.clockin).toBe("2023-12-28T00:00:00.000Z");
    expect(savedWorkouts.workouts).toEqual(workouts);
  });
  it("should append to the existing workouts when the workout for the given date exists", async () => {
    const workouts = [
      { name: "bench", reps: 10, weight: 20, rest: 10, type: "weight" },
      { name: "bench", reps: 10, weight: 30, rest: 10, type: "weight" },
      { name: "running", time: 10, distance: 10, type: "cardio" },
      { name: "pushups", reps: 30, rest: 5, type: "bw" },
    ];
    let workoutOpnObj, workoutId;
    serviceLocator.register("Workout", {
      async findOne() {
        return { _id: 1, workouts };
      },
      async findByIdAndUpdate(id, workoutOpnObject) {
        workoutId = id;
        workoutOpnObj = workoutOpnObject;
      },
    });

    const workoutStartegy = new WorkoutStartegy();
    await workoutStartegy.createWorkout(
      workouts,
      "test@test.com",
      "2023-12-28"
    );
    expect(workoutOpnObj["$set"].clockout).toBeDefined();
    expect(workoutOpnObj["$push"].workouts).toEqual(workouts);
    expect(workoutId).toBe(1);
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
