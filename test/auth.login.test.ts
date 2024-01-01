import { serviceLocator } from "../src/serviceLocator";
import { AuthService } from "../src/user/authService";

describe("test for auth service login func", () => {
  it("should return the authorized user", async () => {
    const User = {
      findOne() {
        return {
          select: async function () {
            return {
              email: "test@test.com",
              password: "password",
              matchPassword: function (enteredPassword: string) {
                return enteredPassword == "password";
              },
              gentoken() {
                return "eyzsecdsrfet";
              },
            };
          },
        };
      },
    };
    serviceLocator.register("User", User);
    const authservice = new AuthService();

    const response = await authservice.login({
      email: "test@test.com",
      password: "password",
    });
    expect(response.email).toEqual("test@test.com");
    expect(response.password).toEqual("password");
  });
  it("should not allow the user to login", async () => {
    try {
      const User = {
        findOne() {
          return {
            select: function () {
              return;
            },
          };
        },
      };
      serviceLocator.register("User", User);
      const authservice = new AuthService();

      const response = await authservice.login({
        email: "test@test.com",
        password: "password",
      });
    } catch (ex: any) {
      expect(ex.statusCode).toBe(404);
    }
  });
  it("should throw error with missing credentials",async ()=>{
    try {
      const User = {
        findOne() {
          return {
            select: function () {
              return;
            },
          };
        },
      };
      serviceLocator.register("User", User);
      const authservice = new AuthService();

      const response = await authservice.login({
        email: "",
        password: "",
      });
    } catch (ex: any) {
      expect(ex.statusCode).toBe(400);
      expect(ex.message).toBe("Missing credentials");
    }
  })
});

