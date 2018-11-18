const express = require("express");

const { MongoClient } = require("mongodb");
const passport = require("passport");
const authRouter = express.Router();

function router(nav) {
  authRouter.route("/signUp").post((req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    const url = "mongodb://localhost:27017";
    const dbName = "PaymentInformation";
    (async function addUser() {
      let client;
      try {
        const Client = await MongoClient.connect(url);
        console.log("connected to server successfully");
        const db = Client.db(dbName);
        const col = await db.collection("users");
        const user = { username, password };
        const results = await col.insertOne(user);
        console.log(results);
        req.login(results.ops[0], () => {
          res.redirect("/auth/profile");
        });
      } catch (error) {
        console.log(error.stack);
      }
    })();
    //create User
  });

  authRouter.route("/logout").get((req, res) => {
    console.log(req.body);
    req.logout();
    res.redirect("/auth/signin");
  });
  authRouter
    .route("/signin")
    .get((req, res) => {
      res.render("signin", { nav, title: "Sign in" });
    })
    .post(
      passport.authenticate("local", {
        successRedirect: "/data",
        failureRedirect: "/auth/signin"
      })
    );
  authRouter
    .route("/profile")
    .all((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect("/auth/signin");
      }
    })
    .get((req, res) => {
      res.json(req.user);
    });

  return authRouter;
}

module.exports = router;
