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

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await userSchema.findOne({ email });
  if (!user) return res.send("Something went wrong");
  bcrypt.compare(password, user.password, (err, result) => {
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

app.get("/posts", isLoggedin, async (req, res) => {
  const { userid } = req.user;
  let user = await userSchema.findOne({ _id: userid });
  await user.populate("post");
  res.render("post", { user });
});

app.post("/posts", isLoggedin, async (req, res) => {
  const { userid } = req.user;
  let post = await postSchema.create({
    user: userid,
    content: req.body.content,
  });
  let user = await userSchema.findOne({ _id: userid });
  user.post.push(post._id);
  await user.save();
  res.redirect("/posts");
});

app.get("/like/:id", isLoggedin, async (req, res) => {
  const { id } = req.params;
  const { userid } = req.user;
  let post = await postSchema.findOne({ _id: id });
  if (post.likes.indexOf(userid) === -1) {
    post.likes.push(userid);
  } else {
    post.likes.splice(post.likes.indexOf(userid), 1);
  }
  await post.save();
  res.redirect("/posts");
});

app.get("/edit/:id", isLoggedin, async (req, res) => {
  let post = await postSchema.findOne({ _id: req.params.id });
  res.render("edit", { post });
});

app.post("/update/:id", isLoggedin, async (req, res) => {
  await postSchema.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  res.redirect("/posts");
});

app.get("/delete/:id", isLoggedin, async (req, res) => {
  await postSchema.findOneAndDelete({ _id: req.params.id });
  res.redirect("/posts");
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

//example of protected routes meaning that if the user is not logged in
//he cannot access these routes

function isLoggedin(req, res, next) {
  if (req.cookies.token === "" || req.cookies.token === undefined) {
    return res.send("You must be logged in!");
  } else {
    let data = jwt.verify(req.cookies.token, "shhhhhhh");
    //this helps to attach the data of the user with the request so that the user data can be used for
    //further tasks in the next route
    req.user = data;
  }
  next();
}

app.listen(3000);
