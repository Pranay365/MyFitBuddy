import { ValidationError } from "yup";
import { isValidUser, isValidWorkouts } from "../src/validation";

describe("test for validating user details", () => {
  it("should validate user successfully", async () => {
    const user = {
      id: "test1",
      name: "test1",
      password: "test1234",
      confirmPassword: "test1234",
    };
    const valid = await isValidUser(user);
    expect(valid).toEqual(user);
  });
  it("should throw validation error as user details are missing", async () => {
    try {
      await isValidUser({});
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toBe(true);
    }
  });
  it("should throw validation error - password less than 6 charcters", async () => {
    try {
      await isValidUser({
        id: "test1",
        name: "test1",
        password: "abcd",
        confirmPassword: "abcd",
      });
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toBe(true);
    }
  });
  it("should throw validation error - password and confirmPassword don't match", async () => {
    try {
      await isValidUser({
        id: "test1",
        name: "test1",
        password: "abcdefghi",
        confirmPassword: "abcd",
      });
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toBe(true);
    }
  });
  it("should validate workouts successfully", async () => {
    const workouts = {
      clockin: "9:30",
      workouts: { squats: [{ reps: 10, weight: 30 }] },
    };
    const workoutsAftervalidation = await isValidWorkouts(workouts);
    expect(workoutsAftervalidation).toStrictEqual(workouts);
  });
  it("should throw error as the workouts structure is invalid", async () => {
    try {
      const workouts = {
        clockin: "9:30",
        workouts: { squats: [] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - missing reps and weight", async () => {
    try {
      const workouts = {
        clockin: "9:30",
        workouts: { squats: [{}] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - missing weight", async () => {
    try {
      const workouts = {
        clockin: "9:30",
        workouts: { squats: [{ reps: 10 }] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - missing reps", async () => {
    try {
      const workouts = {
        clockin: "9:30",
        workouts: { squats: [{ weight: 10 }] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - missing workouts collection", async () => {
    try {
      const workouts = {
        clockin: "9:30",
        workouts: {},
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - reps 0", async () => {
    try {
      const workouts = {
        clockin: "9:30",
        workouts: { squats: [{ reps: 0, weight: 10 }] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - weight 0", async () => {
    try {
      const workouts = {
        clockin: "9:30",
        workouts: { squats: [{ reps: 10, weight: 0 }] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - missing clockin", async () => {
    try {
      const workouts = {
        workouts: { squats: [{ reps: 10, weight: 0 }] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
  it("should throw error as the workouts structure is invalid - reps string", async () => {
    try {
      const workouts = {
        workouts: { squats: [{ reps: "10", weight: 10 }] },
      };
      await isValidWorkouts(workouts);
    } catch (ex: any) {
      expect(ex instanceof ValidationError).toStrictEqual(true);
    }
  });
});
