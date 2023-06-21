import { object, ref, array, number, string, lazy, ValidationError } from "yup";

const workoutSchema = object({
  clockin: string(),
  clockout: string(),
  workouts: lazy((workouts = {}) => {
    let keys = Object.keys(workouts);
    if (keys.length < 1)
      throw new ValidationError(`Atleast one workout should be added`);
    let schema = keys.reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: array()
          .of(
            object().shape({
              reps: number().min(1).required(),
              weight: number().min(1).required(`${cur} should `),
            })
          )
          .min(1),
      }),
      {}
    );
    return object().shape(schema);
  }),
});

const userSchema = object({
  username: string().min(4).max(7).matches(/\w/).required(),
  password: string().min(6).max(8).required(),
  confirmPassword: string()
    .oneOf([ref("password")])
    .required(),
});

export async function isValidUser(user: any) {
  return await userSchema.validate(user);
}

export async function isValidWorkouts(workouts: any) {
  let validatedWorkouts = await workoutSchema.validate(workouts);
  return validatedWorkouts;
}
