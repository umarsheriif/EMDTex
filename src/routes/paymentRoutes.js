const express = require("express");

const paymentRouter = express.Router();
const paymentController = require("../controllers/paymentController.js");
const transactionServices = require("../services/frauddetectionServices.js");

function router(nav) {
  const {
    verifyPayment,
    payWithCredit,
    rejected,
    approved
  } = paymentController(transactionServices, nav);
  paymentRouter.route("/").get(payWithCredit);
  paymentRouter.route("/verify").post(verifyPayment);
  paymentRouter.route("/rejected").get(rejected);
  paymentRouter.route("/approved").get(approved);

  return paymentRouter;
}

module.exports = router;