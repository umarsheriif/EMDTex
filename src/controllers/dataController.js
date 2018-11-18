const { sendthemail } = require("../services/mailServices");
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");
const sql = require("mssql");

const nodemailer = require("nodemailer");
const CosmosClient = require("@azure/cosmos").CosmosClient;
const endpoint = "https://emdtdd.documents.azure.com:443/";
console.log(endpoint);
const masterKey =
  "g0EnFTlKsUh5H0h8jQKvlzjEwjrBqmaPhmYEhyzNdxQQE6buOs3bTaATASV6xTkhQE8aU7bQW2zMN8IWcReQMA==";
const client = new CosmosClient({
  endpoint: endpoint,
  auth: { masterKey: masterKey }
});

const databaseId = "fraud";
const containerId = "cards";

function dataContoller(dataservices, nav) {
  function getIndex(req, res) {
    // const url = "mongodb://localhost:27017";
    // const dbName = "PaymentInformation";

    (async function getAllData() {
      let request;
      let fraudcount;
      try {
        request = await new sql.Request();
        const { result: itemDefList } = await client
          .database(databaseId)
          .container(containerId)
          .items.readAll()
          .toArray();

        request
          .query(
            "select count(isFraud) as fraudcount from newtransactions where isFraud = 1"
          )
          .then(frauddata => {
            fraudcount = frauddata.recordset;
            // console.log(fraudcount[0].fraudcount);
          });
        request
          .query(
            "select count(isFraud) as nofraudcount from newtransactions where isFraud = 0"
          )
          .then(nofrauddata => {
            nofraudcount = nofrauddata.recordset;
            // console.log(fraudcount[0].fraudcount);
          });
        // console.log("fraudcount = " + fraudcount);
        request
          .query(
            " select newtransactions.* , cards.cardHolder, cards.number, merchant.merchant_name,merchant.category,merchant.mzipcode, merchantCat.catname as mecn from newtransactions left join cards ON newtransactions.card_id = cards.id left join merchant on Mid = merchant.id left join merchantCat on merchant.category = merchantCat.id  ORDER BY id"
          )
          .then(data => {
            for (let i = 0; i < itemDefList.length; i++) {
              if (itemDefList[i].isFraud == 1) {
                itemDefList[i].isFraud = "Fraud";
                itemDefList[i].isFraudlabel = "danger";
              } else {
                itemDefList[i].isFraud = "Safe";
                itemDefList[i].isFraudlabel = "success";
              }

              if (itemDefList[i].gender == 1) {
                itemDefList[i].gender = "Male";
              } else {
                itemDefList[i].gender = "Female";
              }
            }
            for (let i = 0; i < data.recordset.length; i++) {
              if (data.recordset[i].isFraud == 1) {
                data.recordset[i].isFraud = "Fraud";
                data.recordset[i].isFraudlabel = "danger";
              } else {
                data.recordset[i].isFraud = "Safe";
                data.recordset[i].isFraudlabel = "success";
              }

              if (data.recordset[i].gender == 1) {
                data.recordset[i].gender = "Male";
              } else {
                data.recordset[i].gender = "Female";
              }
            }
            res.render("dashboard", {
              title: "Data",
              nav,
              frauds: fraudcount[0].fraudcount,
              safe: nofraudcount[0].nofraudcount,
              transactions: data.rowsAffected,
              Orderdata: data.recordset,
              azuredata: itemDefList
            });
          });
      } catch (error) {
        console.log(error.stack);
      }
      // request.close();
    })();
  }
  function getDocument(req, res) {
    // const url = "mongodb://localhost:27017";
    // const dbName = "PaymentInformation";

    (async function getAllData() {
      let request;
      try {
        request = await new sql.Request();


        // console.log("fraudcount = " + fraudcount);
        request
          .query(
            " select * from document"
          )
          .then(data => {
            res.render("documentdashboard", {
              title: "Data",
              nav,
              Orderdata: data.recordset,

            });
          });
      } catch (error) {
        console.log(error.stack);
      }
      // request.close();
    })();
  }
  function letuspay(req, res) {
    res.render("cart", {
      title: "Checkout",
      nav
    });
  }
  function getById(req, res) {
    const { id } = req.params;
    // const url = "mongodb://localhost:27017";
    // const dbName = "PaymentInformation";

    (async function azurestack() {
      try {
        const { result: itemDefList } = await client
          .database(databaseId)
          .container(containerId)
          .items.readAll()
          .toArray();
        request = await new sql.Request();
        request
          .query(
            ` select newtransactions.* , cards.cardHolder, cards.cardType,cards.cvv,cards.number, cards.expiryMonth, cards.expiryYear,merchant.merchant_name,merchant.category,merchant.mzipcode from newtransactions left join cards ON newtransactions.card_id = cards.id left join merchant on Mid = merchant.id  where newtransactions.id = ${id}`
          )
          .then(data => {
            res.json(data.recordset);
          });
      } catch (error) {
        console.log(error.stack);
      }
    })();
  }
  function getByRId(req, res) {
    const { id } = req.params;
    (async function azure() {
      try {
        const querySpec = {
          query: "SELECT *  FROM cards c WHERE c.id = @id ",
          parameters: [
            {
              name: "@id",
              value: `${id}`
            }
          ]
        };

        const { result: results } = await client
          .database(databaseId)
          .container(containerId)
          .items.query(querySpec)
          .toArray();

        res.json(results);
      } catch (error) {
        console.log(error.stack);
      }
    })();
  }

  function getByCard(req, res) {
    const { card } = req.params;
  }

  // function middleware(req, res, next) {
  //   if (req.user) {
  //     next();
  //   } else {
  //     res.redirect("/auth/signin");
  //   }
  // }
  return {
    getIndex,
    getById,
    getByCard,
    getByRId,
    letuspay,
    getDocument
    // middleware
  };
}

module.exports = dataContoller;
