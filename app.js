const express = require("express");
const app = express();
const path = require("path");
const userSchema = require("./models/user");
const postSchema = require("./models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("Home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await userSchema.findOne({ email });
  if (!user) return res.send("Something went wrong");
  bcrypt.compare(password, user.password, (err, result) => {
    console.log(result);
    if (result === true) {
      let token = jwt.sign({ email: user.email, userid: user._id }, "shhhhhhh");
      res.cookie("token", token);
      res.redirect("/posts");
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/posts", (req, res) => {
  res.send("your posts");
});

app.post("/createuser", async (req, res) => {
  let { name, email, password, age } = req.body;

  let user = await userSchema.findOne({ email });
  if (user) return res.status(500).send("User already exists...");

  user = bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userSchema.create({
        username: name,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({ email: user.email, userid: user._id }, "shhhhhhh");
      res.cookie("token", token);
      res.redirect(`/posts`);
    });
  });
});

app.listen(3000);
