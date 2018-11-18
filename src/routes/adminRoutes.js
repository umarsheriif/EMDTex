const express = require("express");

const { MongoClient } = require("mongodb");

const adminRouter = express.Router();

function router(nav) {
  adminRouter.route("/").get((req, res) => {
    const url = "mongodb://localhost:27017";
    const dbName = "PaymentInformation";

    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url);
        console.log("connected correctly");

        const db = client.db(dbName);
        const response = await db.collection("payments").insert(Orderdata);
        res.json(response);
      } catch (error) {
        console.log(error.stack);
      }
      client.close();
    })();
    // res.send('Verifying Card');
  });

  return adminRouter;
}

module.exports = router;
