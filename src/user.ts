import { srcDir } from "./config";
import { getHealthStats, getUserProfile, readFilePromise, saveSettings, } from "./util";
import path from "path";


export async function user(req,res){
  const userObj = req.user;
  const username = userObj.email.split("@")[0];
  const userHealthStats = await getHealthStats(username);
  delete userObj.hashedPassword;
  userObj.role = "authenticated";
  userObj.health = userHealthStats;
  return res.status(200).json(userObj);
};

export async function userSettings(req,res){
  const userObj = req.user;
  const username = userObj.email.split("@")[0];
  const { heartbeat, maintenance_cal, sleep } = req.body;
  const settings = await saveSettings(
    username,
    heartbeat,
    maintenance_cal,
    sleep
  );
  return res.status(201).json(settings);
}

 export async function getUserProfilePic(req, res){
   const profile = await getUserProfile(req.params.name);
   res.setHeader("content-type", "image/jpg");
   if(profile){
     res.send(profile);
    }
    else{
      const defaultFile=await readFilePromise(path.join(srcDir,"default-user.jpg"))
      res.send(defaultFile);
    }
 };

