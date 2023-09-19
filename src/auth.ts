import sharp from "sharp";
import store from "./store";
import { getUserfromDB, register } from "./util";
import { getCookies, getHealthStats } from "./util";
import { MESSAGE } from "./constants";
import { ValidationError } from "yup";
import { compare } from "bcryptjs";

export async function isAuthenticated(req: any, res: any, next: any) {
  try {
    let reqCookie = getCookies(req);
    console.log("reqCookie in isAuthenticated", reqCookie);
    const resCookie = await store.get(reqCookie.registrationId);
    if (resCookie) {
      const userObj = await getUserfromDB(resCookie?.username);
      if (userObj) {
        req.user = userObj;
        req.registrationId = resCookie.value;
        res.setHeader(
          "Set-cookie",
          `registrationId=${userObj.registrationId};Max-Age=${
            24 * 60 * 60
          };path=/;sameSite=none;secure=true;HttpOnly=true`
        );
        return next();
      }
    } else {
      return res.status(403).json("Unauthorized access");
    }
  } catch (ex: any) {
    console.log(ex);
  }
};
export async function logout(req,res){
  const userObj = req.user;
  try {
    await store.remove(userObj.registrationId);
    res.removeHeader("Set-Cookie");
    res.setHeader(
      "Set-Cookie",
      "registrationId=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
    );
    return res.status(200).json("Logged out successfully");
  } catch (ex) {
    return res.status(400).json("Unable to logout");
  }
}

export async function signup (req, res, next) {
  try {
    
      const avatar = req.file && await sharp(req.file?.buffer)
      .resize({ height: 100, width: 100 })
      .png()
      .toBuffer();
    
    const { email, password, confirmPassword, first_name, last_name } =
      req.body;
    console.log(req.body);
    console.log(email, password, confirmPassword, avatar);
    const username = email?.split("@")[0];
    const registrationId: string = await register(
      username,
      password,
      confirmPassword,
      email,
      first_name,
      last_name,
      avatar
    );
    if (registrationId) {
      return res.status(200).json({
        status: MESSAGE.MESSAGE_REGISTRATION_SUCESS,
        body: JSON.stringify({ registrationId }),
      });
    } else {
      return res.status(400).json({
        status: MESSAGE.MESSAGE_REGISTRATION_FAIL,
        body: JSON.stringify({ message: MESSAGE.MESSAGE_REGISTRATION_FAIL }),
      });
    }
  } catch (ex) {
    if (ex instanceof ValidationError) {
      console.log(JSON.stringify(ex, null, 2));
      return res.status(400).json(MESSAGE.MESSAGE_INVALID_USER);
    }
    return res.status(500).json(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
  }
}

export async function login(req, res) {
  try {
    let reqCookie = getCookies(req);
    console.log("cookies is ", reqCookie);
    const resCookie = await store.get(reqCookie.registrationId);
    if (resCookie) {
      console.log(resCookie);
      const userObj = await getUserfromDB(resCookie.username);
      const userHealthStats = await getHealthStats(resCookie.username);
      res.setHeader(
        "Set-cookie",
        `registrationId=${resCookie.value};Max-Age=${
          24 * 60 * 60
        };path=/;samesite=None;secure=true;HttpOnly=true`
      );
      delete userObj.hashedPassword;
      userObj.role = "authenticated";
      userObj.heath = userHealthStats;
      return res.status(200).json(userObj);
    }
    const { email: username, password } = req.body;
    const userObj = await getUserfromDB(username?.split("@")[0]);
    console.log(userObj);
    if (userObj) {
      const isAuthenticated = await compare(password, userObj?.hashedPassword);
      if (isAuthenticated) {
        //req.session.registrationId = registrationId;
        res.setHeader(
          "Set-cookie",
          `registrationId=${userObj.registrationId};Max-Age=${
            24 * 60 * 60
          };path=/;samesite=none;secure=true;HttpOnly=true`
        );
        await store.set(
          username?.split("@")[0],
          "registrationId",
          userObj.registrationId
        );
        delete userObj.hashedPassword;
        userObj.role = "authenticated";
        const userHealthStats = await getHealthStats(username?.split("@")[0]);
        userObj.heath = userHealthStats;
        return res.status(200).json(userObj);
      }
    }
    return res.status(401).json({
      body: MESSAGE.MESSAGE_LOGIN_FAIL,
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).send(MESSAGE.MESSAGE_INTERNAL_SERVER_ERROR);
  }
}