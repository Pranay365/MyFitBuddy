// workoutList={
//   "2023-03-08":{
//     "clockin":"9:00",
//     "clcokout":"9:30"
//     "workouts":{"Squats":[{reps:10,weight:20,time:"9:00"}]}
//   }

// }

export type WorkoutList = {
  [date: string]: Workout;
};

export type Workout = {
  clockin: string;
  clockout?: string;
  workouts: WorkoutSets;
};

export type Meal = {
  name: string;
  composition: any[];
  time: string;
  totalCal: number;
};
export type WorkoutSets = {
  [workoutName: string]: Set[] ;
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
