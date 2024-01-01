import ErrorResponse from "../ErrorResponse";
import * as db from "../db";

export class AuthService {
  async login(credentials) {
    const { email, password } = credentials;
    if (!email || !password)
      throw new ErrorResponse("Missing credentials", 400);
    const user: any = await db.execute("User", "findOne", [{ email }], {
      select: "password",
    });
    if (!user) throw new ErrorResponse("User not found", 404);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new ErrorResponse("Invalid credentials", 400);
    return user;
  }
  async signup(credentials) {
    console.log(credentials);
    const { name, email, password, confirmPassword } = credentials;
    if (!email || !password || password !== confirmPassword) {
      throw new ErrorResponse("Missing credentials", 400);
    }

    const user = await db.execute("User", "create", [
      { name, email, password },
    ]);
    return user;
  }
  async getUserfromDBById(userid: string) {
    let user = await db.execute("User", "findById", [userid]);
    if (!user) throw new Error("User not found");
    return user;
  }
  async getUserfromDB(email: string) {
    let user = await db.execute("User", "findOne", [{ email }]);
    if (!user) throw new Error("User not found");
    return user;
  }
  async saveUserHealthStats(email, healthStats) {
    let savedHealthStats;
    const { heartbeat, maintain_cal, sleep } = healthStats;
    savedHealthStats = await db.execute("User", "findOneAndUpdate", [
      { email },
      {
        $set: {
          "data.email": email,
          "data.heartbeat": heartbeat,
          "data.maintain_cal": maintain_cal,
          "data.sleep": sleep,
        },
      },
      {
        new: true,
      },
    ]);
    return savedHealthStats;
  }
}
