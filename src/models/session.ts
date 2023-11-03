import { Schema, model } from "mongoose";

const sessionSchema = new Schema({
  name: String,
  value: String,
  username: String,
  expires: String,
});

export const Session = model("User", sessionSchema);
