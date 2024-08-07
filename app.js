const express = require("express");
const app = express();
const path = require("path");
const userSchema = require("./models/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("Home");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/post/:userId", (req, res) => {
  res.send("account created succesfully");
});

app.post("/createuser", async (req, res) => {
  console.log(req.body);
  let { name, email, password, age } = req.body;
  let user = await userSchema.create({
    username: name,
    email,
    password,
    age,
  });
  res.redirect(`/post/${user._id}`);
});

app.listen(3000);
