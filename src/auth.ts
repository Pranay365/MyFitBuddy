import { readFilePromise, writeFilePromise } from "./util";
import { join } from "path";
import { v4 } from "uuid";

const _isValidUser = (
  userid: string,
  name: string,
  passWord: string,
  confirmPassword: string
) => {
  return (
    /^\w+$/.test(userid) &&
    /[a-zA-Z]$/.test(name) &&
    passWord == confirmPassword
  );
};
export async function register(
  userid: string,
  name: string,
  password: string,
  hashedPassword: string,
  confirmPassword: string
) {
  try {
    if (_isValidUser(userid, name, password, confirmPassword)) {
      const registrationId = v4();
      const date = new Date();
      const filePath = `${join(__dirname, "users")}.json`;
      const usrObj = {
        [registrationId]: {
          userid,
          name,
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
    return ``;
  } catch (ex: any) {
    throw new Error(ex);
  }
}
export async function getUserfromDB(registrationId: string) {
  try {
    const filePath = `${join(__dirname, "users")}.json`;
    const userObjInJson = await readFilePromise(filePath, "utf-8");
    const userObj = JSON.parse(userObjInJson);
    return userObj[registrationId];
  } catch (ex: any) {
    return;
  }
  return;
}
//async function login(userid: string, password: string) {}
