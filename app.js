const express = require("express");
const app = express();
const path = require("path");
const userSchema = require("./models/user");
const bcrypt = require("bcrypt");

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

app.post("/createuser", (req, res) => {
  let { name, email, password, age } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userSchema.create({
        username: name,
        email,
        password: hash,
        age,
      });
      res.redirect(`/post/${user._id}`);
    });
  });
});

app.listen(3000);
