import { object, array, number, string, lazy } from "yup";

const workoutSchema = object({
  clockin: string(),
  clockout: string(),
  workouts: lazy((workouts) => {
    let schema = Object.keys(workouts).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: array().of(
          object().shape({
            reps: number().required(),
            weight: number().required(),
          })
        ),
      }),
      {}
    );
    return object().shape(schema);
  }),
});

export async function isValidWorkouts(workouts: any) {
  let validatedWorkouts = await workoutSchema.validate(workouts);
  return validatedWorkouts;
}
