import { User } from "./models/user";
import * as jwt from "jsonwebtoken";

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: true, error: "Missing credentials" });
  const user: any = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user)
    return res
      .status(401)
      .json({ success: true, error: `invalid credentials` });
  console.log(password);
  const isMatch = await user.matchPassword(password);
  if (!isMatch)
    return res
      .status(401)
      .json({ success: true, error: `invalid credentials` });
  return sendTokenResponse(res, user);
}

export async function signup(req, res) {
  const { name, email, password, confirmPassword } = req.body;
  console.log(req.body);
  if (!email || !password || password !== confirmPassword) {
    return res.status(400).json({ success: false, error: "Invalid entry" });
  }
  const user = await User.create({ name, email, password });
  return sendTokenResponse(res, user);
}
function sendTokenResponse(res, user) {
  const token = user.genToken();
  user.password = undefined;
  const options = {
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV === "prod") {
    options.secure = true;
  }
  res
    .status(200)
    .cookie("access-token", token, options)
    .json({ success: true, data: user,token:token });
}

export async function authorized(req, res, next) {
  console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, "badass app");
      console.log(decoded);
      const user = await User.findById(decoded);
      console.log(user);
      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      return res.status(401).json({ success: false, error: `Unauthorized` });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized access" });
  }
}
