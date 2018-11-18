const express = require("express");

const dataRouter = express.Router();
const dataController = require("../controllers/dataController.js");
const dataservices = require("../services/goodreadsServices.js");

function router(nav) {
  const { getIndex, getById, getByCard, getByRId, letuspay, getDocument } = dataController(
    dataservices,
    nav
  );
  //# We have to activate middle ware in order to check if the user is authenticated or not
  // dataRouter.use(middleware);
  dataRouter.route("/").get(getIndex);
  dataRouter.route("/document").get(getDocument);
  dataRouter.route("/checkout").get(letuspay);
  dataRouter.route("/:id").get(getById);
  dataRouter.route("/api/cosmos/:id").get(getByRId);
  dataRouter.route("/api/:card").post(getByCard);

  return dataRouter;
}

module.exports = router;
