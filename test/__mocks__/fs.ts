jest.createMockFromModule("fs");
process.env.users = JSON.stringify({});
process.env.workouts = JSON.stringify({});
process.env.readFileCalls = "0";
process.env.writeFileCalls = "0";
//@ts-ignore
function readFile(path: string, encoding: string, cb: Function) {
  process.env.readFileCalls = `${+(process.env.readFileCalls || 0) + 1}`;
  if (path.includes("throw")) {
    return cb({ code: "ENOENT", msg: "Failed to write" });
  }
  if (path.includes("users.json")) {
    return cb(null, process.env.users);
  }
  if (path.includes("workouts")) {
    return cb(null, process.env.workouts);
  }
}

function writeFile(path: string, data: any, cb: Function) {
  process.env.writeFileCalls = `${+(process.env.writeFileCalls || 0) + 1}`;
  
  if (path.includes("users.json")) {
    return cb(
      null,
      JSON.stringify({ ...JSON.parse(process.env.users!), data })
    );
  }
  if (path.includes("workouts")) {
    return cb(
      null,
      JSON.stringify({ ...JSON.parse(process.env.workouts!), data })
    );
  }
}

module.exports = {
  writeFile,
  readFile,
};
