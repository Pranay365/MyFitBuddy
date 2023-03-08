export type WorkoutList = {
  [key: string]: Workout;
};

export type Workout = {
  clockin: string;
  clockout: string;
  workouts: WorkoutSets;
};
export type Meal = {
  name: string;
  composition: any[];
  time: string;
  totalCal: number;
};

export type WorkoutSets = {
  [workoutname: string]: Set[];
};
export type Set = {
  reps: number;
  weight: number;
  time: string;
};

declare module "express-session" {
  export interface SessionData {
    registrationId: string;
  }
}
