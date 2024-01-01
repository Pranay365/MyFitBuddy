import { compare, genSalt, hash } from "bcryptjs";
import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import { number } from "yargs";
export interface UserDoc extends mongoose.Document {
  _id: string;
  name: string;
  password: string;
  matchPassword?: (pwd: string) => Promise<Boolean>;
  genToken?: () => string;
}

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  createdAt: { type: String, default: new Date(Date.now()) },
  sleep: { type: Number, default: 0 },
  heartbeat: { type: Number, default: 0 },
  maintain_cal: { type: Number, default: 0 },
});

userSchema.pre("save", async function () {
  const password = await hash(this.password, 10);
  this.password = password;
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  console.log(enteredPassword, this.password);
  const matched = await compare(enteredPassword, this.password);
  console.log(matched);
  return matched;
};
userSchema.methods.genToken = function () {
  console.log(this._id);
  const token = jwt.sign(
    this._id.toString(),
    process.env.JWT_SECRET! || "badass app"
  );
  return token;
};
export const User = mongoose.model("User", userSchema);
