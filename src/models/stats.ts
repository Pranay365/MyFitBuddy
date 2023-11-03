import * as mongoose from "mongoose";

export interface StatsType {
  sleep: String;
  heartbeat: String;
  maintain_cal: String;
}
const StatsSchema = new mongoose.Schema({
  email: String,
  sleep: String,
  heartbeat: String,
  maintain_cal: String,
});

export const Stats = mongoose.model("Stats", StatsSchema);
