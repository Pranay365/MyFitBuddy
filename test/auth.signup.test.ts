import { serviceLocator } from "../src/serviceLocator";
import { AuthService } from "../src/user/authService";

describe("test for signup functionality", () => {
  it("should successfully signup the user", async () => {
    const User = {
      async create() {
        return {
          name: "test",
          email: "test@test.com",
          password: "password",
        };
      },
    };
    serviceLocator.register("User", User);
    const authservice = new AuthService();
    const user = await authservice.signup({
      name: "test",
      email: "test@test.com",
      password: "password",
      confirmPassword: "password",
    });
    expect(user).toEqual({
      name: "test",
      email: "test@test.com",
      password: "password"
    });
  });
  it("should not allow user to signup as the request is missing credentials",async ()=>{
    try{
        const authService=new AuthService();
        await authService.signup({})
    }
    catch(ex:any){
      expect(ex.message).toBe("Missing credentials");
      expect(ex.statusCode).toBe(400);
    }
  } )
});
