const express = require("express");
const app = express();

app.use("/", (req, res) => {
  res.send("Feeling good the interview went good..");
});

app.listen(3000);
