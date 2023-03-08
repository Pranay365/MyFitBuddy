async function run() {
  let workouts = {
    squats: [
      { reps: 12, weight: 20 },
      { reps: 12, weight: 20 },
    ],
  };
  const userObj = {
    id: "pranay",
    password: "prasad",
    confirmPassword: "prasad",
    name: "Pranay",
  };
  fetch("http://localhost:3000/signup", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userObj),
  })
    .then((res) => res.json())
    .then(console.log);
}

run();
