const express = require("express");
const app = express();
const path = require("path");
const userSchema = require("./models/user");
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

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/post/:userId", (req, res) => {
  res.send("account created succesfully");
});

app.post("/createuser", (req, res) => {
  let { name, email, password, age } = req.body;

  let user = userSchema.findOne({ email });
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
      res.redirect(`/post/${user._id}`);
    });
  });
});

app.listen(3000);
