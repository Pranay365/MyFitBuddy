import { parseWorkouts, createWorkouts, writeRecordsToDb } from "../tmp/util";

jest.mock("fs");
describe("test for managing workouts", () => {
  const allWorkoutsinJson = JSON.stringify({
    "2023-03-07": {
      clockin: "09:30",
      workouts: {
        squats: [
          {
            reps: 10,
            weight: 10,
            time: "9:35",
          },
        ],
      },
    },
  });
  it("should parseWorkouts successfully", () => {
    const workouts = parseWorkouts(allWorkoutsinJson, "2023-03-07");
    expect(workouts).toStrictEqual({
      squats: [
        {
          reps: 10,
          weight: 10,
          time: "9:35",
        },
      ],
    });
    const workoutsUndefined = parseWorkouts(JSON.stringify({}), "2023-03-07");
    expect(workoutsUndefined).not.toBeDefined();
  });
  it("should parseWorkouts with workoutnames successfully", () => {
    const allWorkoutsinJson = JSON.stringify({
      "2023-03-07": {
        clockin: "09:30",
        workouts: {
          squats: [
            {
              reps: 10,
              weight: 10,
              time: "9:35",
            },
          ],
          deadlifts: [
            {
              reps: 10,
              weight: 10,
              time: "9:45",
            },
          ],
        },
      },
    });
    const workouts = parseWorkouts(
      allWorkoutsinJson,
      "2023-03-07",
      "squats,deadlifts"
    );
    expect(workouts).toStrictEqual([
      [
        {
          reps: 10,
          weight: 10,
          time: "9:35",
        },
      ],
      [
        {
          reps: 10,
          weight: 10,
          time: "9:45",
        },
      ],
    ]);
  });
  it("should add or replace the workouts for a given date when the complete new workout is provided ", async () => {
    let workoutsToSave = {
      clockin: "9:30",
      workouts: { deadlifts: [{ reps: 10, weight: 10, time: "9:30" }] },
    };
    const newWorkouts = await createWorkouts(
      allWorkoutsinJson,
      "2023-03-07",
      workoutsToSave
    );
    expect(newWorkouts).toEqual(
      JSON.stringify({ "2023-03-07": workoutsToSave })
    );
  });
  it("should add the workouts to existing set of a workout when the workouts is provided in sets", async () => {
    let workoutsToSave = {
      workouts: {
        squats: [{ reps: 20, weight: 20, time: "11:30" }],
      },
    };
    const newWorkouts = await createWorkouts(
      allWorkoutsinJson,
      "2023-03-07",
      workoutsToSave
    );
    let workoutsAfterAddition = {
      "2023-03-07": {
        clockin: "09:30",
        workouts: {
          squats: [
            {
              reps: 10,
              weight: 10,
              time: "9:35",
            },
            {
              reps: 20,
              weight: 20,
              time: "11:30",
            },
          ],
        },
      },
    };
    expect(newWorkouts).toEqual(JSON.stringify(workoutsAfterAddition));
  });
  it("should be call writeFile once to create a workout when exception occurs", async () => {
    await writeRecordsToDb("test1", "{}");
    expect(process.env.writeFileCalls).toBe("2");
  });
});
