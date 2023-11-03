import mongoose from "mongoose";

export async function connectDb(req, res, next) {
  const con = await mongoose.connect(process.env.CON_STRING!);
  console.log(`MongoDb connected `, con);
  if (con) next();
}
