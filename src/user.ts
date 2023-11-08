import { srcDir } from "./config";
import { StatsType } from "./models/stats";
import {
  getHealthStats,
  getUserProfile,
  getUserfromDB,
  readFilePromise,
  saveSettings,
} from "./util";
import path from "path";

export async function getUser(req, res) {
    const {
      heartbeat = 0,
      sleep = 0,
      maintain_cal = 0,
    } = (await getHealthStats(req.user.email)) as StatsType;
    const { email, name } = await getUserfromDB(req.user._id);
    const data = { email, name, heartbeat, sleep, maintain_cal };
    return res.status(200).json({ success: true, data });
}

export async function saveUserSettings(req, res) {
  console.log(req.body);
  const { heartbeat, maintain_cal, sleep } = req.body;
    const settings = await saveSettings(
      req.user.email,
      heartbeat,
      maintain_cal,
      sleep
    );
    return res.status(201).json({ success: true, data: settings });
}

export async function getUserProfilePic(req, res) {
  const profile = await getUserProfile(req.params.name);
  res.setHeader("content-type", "image/jpg");
  if (profile) {
    res.send(profile);
  } else {
    const defaultFile = await readFilePromise(
      path.join(srcDir, "default-user.jpg")
    );
    res.send(defaultFile);
  }
}
