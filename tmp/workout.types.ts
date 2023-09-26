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
type WorkoutSession = {
  id:string;
  clockin: string;
  clockout: string;
  type: "weight" | "cardio" | "bw"; // The type of workout session
  workouts: Workout[]; // List of individual workouts
  date: string;
};

const workoutSessions: WorkoutSession[] = [
  // ... (the provided array of workout sessions)
];
