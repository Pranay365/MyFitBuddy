import { register, getUserfromDB } from "../src/user";
jest.mock("fs");
describe("test for auth", () => {
  it("should register user and generate uuid and call readfile", async () => {
    const registrationId = await register(
      "test1",
      "test1",
      "testabcd",
      "testabcd"
    );
    expect(registrationId).toMatch(
      /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/
    );
    expect(process.env.readFileCalls).toBe("1");
    expect(process.env.writeFileCalls).toBe("1");
  }, 15000);
  it("should not register the user as the userdetails are invalid", async () => {
    try {
      await register("test1", "test1", "test", "testabcd");
    } catch (ex: any) {
      expect(process.env.readFileCalls).toBe("1");
      expect(process.env.writeFileCalls).toBe("1");
    }
  });
  it("should return undefined as there are no users in db and call readFile once", async () => {
    const user = await getUserfromDB("1234");
    expect(user).not.toBeDefined();
    expect(process.env.readFileCalls).toBe("2");
    expect(process.env.writeFileCalls).toBe("1");
  });
});
