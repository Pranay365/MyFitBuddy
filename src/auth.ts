import { readFilePromise, writeFilePromise } from "./util";
import { join } from "path";
import { v4 } from "uuid";
import { isValidUser } from "./validation";
import { hash } from "bcryptjs";

export async function register(
  username: string,
  password: string,
  confirmPassword: string
) {
  await isValidUser({ username, password, confirmPassword });
  const hashedPassword = await hash(password, 8);
  const registrationId = v4();
  const date = new Date();
  const filePath = `${join(__dirname, "users")}.json`;
  const usrObj = {
    [username]: {
      registrationId,
      hashedPassword,
      createdAt: date.toISOString(),
    },
  };
  const existingUsersInJson =
    (await readFilePromise(filePath, "utf-8")) || JSON.stringify({});
  let existingUsers = JSON.parse(existingUsersInJson);
  existingUsers = { ...existingUsers, ...usrObj };
  await writeFilePromise(filePath, JSON.stringify(existingUsers));
  return registrationId;
}

export async function getUserfromDB(username: string) {
  try {
    const filePath = `${join(__dirname, "users")}.json`;
    const userObjInJson = await readFilePromise(filePath, "utf-8");
    const userObj = JSON.parse(userObjInJson);
    return userObj[username];
  } catch (ex: any) {
    return;
  }
}
//async function login(userid: string, password: string) {}
