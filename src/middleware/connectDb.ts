import mongoose from "mongoose";

let con;
let pending = [] as any;
export async function connectDb(req, res, next) {
  if (con) {
    return pending.push({ req, res, next });
  }
  try {
    con = await mongoose.connect(
      process.env.CON_STRING! ||
        "mongodb+srv://pranayprasad:Pranay%409876@cluster0.cnnp0mj.mongodb.net/devCamper?retryWrites=true&w=majority"
    );
    console.log(`MongoDb connected `);
    if (con) {
      pending.forEach((next) => next());
    }
  } catch (ex) {
    pending.forEach((request) => {
      request.res.json(500).send("Unable to connect to storage service");
    });
  }
}
