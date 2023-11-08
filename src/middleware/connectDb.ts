import mongoose from "mongoose";

export async function connectDb(req, res, next) {
  const con = await mongoose.connect(
    process.env.CON_STRING! ||
      "mongodb+srv://pranayprasad:Pranay%409876@cluster0.cnnp0mj.mongodb.net/devCamper?retryWrites=true&w=majority"
  );
  console.log(`MongoDb connected `, con);
  if (con) next();
}
