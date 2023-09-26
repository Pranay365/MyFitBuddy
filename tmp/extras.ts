// app.get("/workouts/:date/", isAuthenticated, async function (req: any, res) {
//   try {
//     const { date, id } = req.params;
//     let { workoutnames } = req.query;
//     console.log(date, req.userObj.name, workoutnames);
//     //validate date and id
//     if (date?.split("-").length == 3 && req.userObj.name) {
//       const allWorkoutsinJson = ""; //await readWorkoutsFromDb(req.userObj.name);
//       const workouts = parseWorkouts(
//         allWorkoutsinJson,
//         date,
//         workoutnames as string
//       );
//       if (workouts) return res.status(200).send(workouts);
//       else return res.status(404).json(MESSAGE.MESSAGE_WORKOUT_NOT_FOUND);
//     }
//     return res.status(400).json(MESSAGE.MESSAGE_INAVLID_WORKOUTS);
//   } catch (ex: any) {
//     console.log(ex);
//     if (ex.message.includes("JSON")) {
//       res.status(500).json({ err: MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR });
//     }
//     res.status(404).json({ err: MESSAGE.MESSAGE_WORKOUT_NOT_FOUND });
//   }
// });

// app.get("/stats/:id/:workoutName", isAuthenticated, async (req, res) => {
//   const { id, workoutName } = req.params;
//   const { startDate, endDate } = req.query;
//   if (
//     typeof startDate == "string" &&
//     typeof endDate == "string" &&
//     typeof id == "string" &&
//     typeof workoutName == "string"
//   ) {
//     const allWorkouts = await readStatsForWorkout(
//       id,
//       workoutName,
//       startDate,
//       endDate
//     );
//     return res.status(200).json({
//       status: 200,
//       body: JSON.stringify(allWorkouts),
//     });
//   }
//   return res.status(404).json({ err: MESSAGE.MESSAGE_WORKOUT_NOT_FOUND });
// });
//@ts-ignore
// app.post(
//   "/workouts/:date/:id",
//   isAuthenticated,
//   async function (req: any, res) {
//     try {
//       const { date } = req.params;
//       //const { workouts } = req.body;
//       console.log(req.body);
//       console.log(JSON.stringify(req.body, null, 2));
//       const allWorkoutsinJson = ""; //await readWorkoutsFromDb(req.userObj.name);
//       const newWorkouts = await createWorkouts(
//         allWorkoutsinJson,
//         date,
//         req.body
//       );
//       if (newWorkouts) {
//         await writeRecordsToDb(req.userObj.name, newWorkouts);
//         return res
//           .status(201)
//           .json({ status: 201, body: MESSAGE.MESSAGE_SUCCESS });
//       }
//       return res
//         .status(400)
//         .json({ status: 400, body: MESSAGE.MESSAGE_INAVLID_WORKOUTS });
//     } catch (ex: any) {
//       console.log(ex);
//       if (ex.errors) {
//         return res.status(400).json(ex.errors);
//       }
//       return res.status(500).json(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
//     }
//   }
// );
