const passport = require("passport");
const { Strategy } = require("passport-local");
const { MongoClient } = require("mongodb");

module.exports = function localStrategy() {
  passport.use(
    new Strategy(
      {
        usernameField: "username",
        passwordField: "password"
      },
      (username, password, done) => {
        const url = "mongodb://localhost:27017";
        const dbName = "PaymentInformation";
        (async function mongo() {
          let Client;
          try {
            const Client = await MongoClient.connect(url);
            console.log("connected to server successfully");
            const db = Client.db(dbName);
            const col = await db.collection("users");
            const user = await col.findOne({ username });
            if (user != null && user.password == password) {
              done(null, user);
            } else {
              done(null, false);
            }
          } catch (error) {
            console.log(error.stack);
          }
          Client.close();
        })();
      }
    )
  );
};
