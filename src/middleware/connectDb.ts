import mongoose from "mongoose";

let con;
let pending = [] as any;
export async function connectDb(req, res, next) {
  try {
    pending.push({ req, res, next });
    let nextReq;
    con = await mongoose.connect(
      process.env.CON_STRING! ||
        "mongodb+srv://pranayprasad:Pranay%409876@cluster0.cnnp0mj.mongodb.net/devCamper?retryWrites=true&w=majority"
    );
    console.log(`MongoDb connected `);
    if (mongoose.connection.readyState == 1) {
      while ((nextReq = pending.pop())) {
        nextReq.next();
      }
    }
  } catch (ex) {
    pending.forEach((request) => {
      request.res.json(500).send("Unable to connect to storage service");
    });
  }
}
