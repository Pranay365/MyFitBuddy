type weightedWorkout = {
  name: string;
  reps: string;
  weight: string;
  type:"weight"
};

type cardioWorkout = {
  name: string;
  distance: number;
  time: number;
  type:"cardio"
};

type bodyWeightWorkout={
  name:string;
  reps:string;
  type:"bw";
}
export type Workout = cardioWorkout | weightedWorkout | bodyWeightWorkout;
export type WorkoutSession = {
  email:string;
  clockin: string;
  clockout: string;
  workouts: Workout[]; // List of individual workouts
  date: string;
};


