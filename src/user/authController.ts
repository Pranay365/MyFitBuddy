import { AuthService } from "./authService";

const authService = new AuthService();

export async function login(req, res) {
  const user = await authService.login(req.body);
  return sendTokenResponse(res, user);
}

export async function signup(req, res) {
  const user = await authService.signup(req.body);
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
    .json({ success: true, data: user, token: token });
}

export async function getUser(req, res) {
  const {
    email,
    name,
    heartbeat = 0,
    sleep = 0,
    maintain_cal = 0,
  } = await authService.getUserfromDB(req.user.email);

  const data = { email, name, heartbeat, sleep, maintain_cal };
  return res.status(200).json({ success: true, data });
}

export async function saveUserSettings(req, res) {
  console.log(req.body);
  const settings = await authService.saveUserHealthStats(
    req.user.email,
    req.body
  );
  return res.status(201).json({ success: true, data: settings });
}
