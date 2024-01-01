import { serviceLocator } from "../serviceLocator";
import * as jwt from "jsonwebtoken";
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
      const User = serviceLocator.get("User");
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
