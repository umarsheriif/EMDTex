const { MongoClient, ObjectID } = require("mongodb");
const { sendthemail } = require("../services/mailServices");
const CreditCard = require("credit-card");
const sql = require("mssql");
const DocumentClient = require("documentdb").DocumentClient;
const CosmosClient = require("@azure/cosmos").CosmosClient;

// const config = require("./../../config");
const url = require("url");

// ADD THIS PART TO YOUR CODE
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
const now = new Date();

function paymentController(transactionServices, nav) {
  function verifyPayment(req, res) {
    const {
      cardNumber,
      name,
      cardtype,
      year,
      month,
      cvv,
      mobile,
      gender,
      age,
      czipcode,
      Mname,
      Mzipcode,
      merchantCat,
      ammount
    } = req.body;
    const card = {
      cardType: cardtype,
      number: cardNumber,
      expiryMonth: month,
      expiryYear: year,
      cvv: cvv,
      lastused: now
    };
    (async function validate() {
      const request = await new sql.Request();
      let mid = Mname.substr(1);
      let encryptedCN = "xxxx-xxxx-xxxx-xxxx";
      try {
        const validation = await CreditCard.validate(card);
        let creditCardStatus;
        let merchant_id;
        let flag;
        const lastfour = cardNumber.slice(-4);
        if (lastfour == "1234" && validation.isExpired == false) {
          creditCardStatus = "good";
          validation.validCardNumber = true;
          validation.validCvv = true;
        } else {
          creditCardStatus = "fraud";
        }
        const detail = await transactionServices.checkIfFraud({
          Cage: age,
          Cgender: gender,
          zipCustomer: czipcode,
          merchantID: mid,
          zipMerchant: Mzipcode,
          category: merchantCat,
          Tamount: ammount
        });
        console.log("recieved validation");
        validation.APIresponse = detail.data;
        console.log("recieved validation 2");

        validation.card.CardHolder = name;
        const { transporter } = sendthemail();
        const { mailOptions } = sendthemail(
          `${name} payment is  ${validation.APIresponse.status} `,
          validation.APIresponse.TransactionMsg +
            " with reason of " +
            validation.APIresponse.Reason
        );
        console.log("Ready to query");

        queryCards = await request.query(
          `insert into cards (cardHolder,cardType,number,expiryMonth,expiryYear,cvv) values ('${
            validation.card.CardHolder
          }', '${validation.card.cardType}','${validation.card.number}', '${
            validation.card.expiryMonth
          }', '${validation.card.expiryYear}','${
            validation.card.cvv
          }'); SELECT id FROM cards WHERE id = SCOPE_IDENTITY();`
        );
        console.log("query 1 is done");
        queryMerchants = await request
          .query(`SELECT id FROM merchant where merchant_name ='${Mname}'`)
          .then(result => {
            if (result.rowsAffected > 0) {
              merchant_id = result.recordset[0].id;
              flag = "true";
            } else {
              flag = "false";
            }
          });
        if (flag == "false") {
          addMerchants = await request.query(
            `INSERT INTO merchant (id, merchant_name, category, mzipcode) values ('${mid}','${Mname}','${merchantCat}','${Mzipcode}');`
          );
          console.log(addMerchants);
          merchant_id = mid;
        }

        const cardId = queryCards.recordset[0].id;
        const isFraud = detail.data.isFraud;
        queryTransaction = await request.query(
          `insert into newtransactions ( mobile, gender, age,  czipcode, Mid, card_id,isFraud,amount) values('${mobile}','${gender}','${age}','${czipcode}','${merchant_id}','${cardId}','${isFraud}','${ammount}'); SELECT id FROM newtransactions WHERE id = SCOPE_IDENTITY();`
        );
        merchantCatquery = await request.query(
          `SELECT catname FROM merchantCat WHERE id = ${merchantCat}`
        );
        const refrrenceID = queryTransaction.recordset[0].id;
        const mecn = merchantCatquery.recordset[0].catname;
        console.log(mecn);
        const safedata = {
          cardtype,
          gender,
          age,
          czipcode,
          Mname,
          Mzipcode,
          merchantCat,
          mecn,
          ammount,
          isFraud,
          now,
          encryptedCN,
          refrrenceID
        };
        const { item, id } = await client
          .database(databaseId)
          .container(containerId)
          .items.create(safedata);

        updateRequest = await request.query(
          `  update newtransactions set [ref_id] = '${
            item.id
          }'  where id = ${refrrenceID}`
        );
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("Message sent: %s", info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        });
        if (isFraud == 1) {
          res.redirect("/payment/rejected");
        } else {
          res.redirect("/payment/approved");
        }
      } catch (error) {
        console.log(error.stack);
      }
    })();
  }

  function payWithCredit(req, res) {
    res.render("payment", { nav, title: "Complete your Payment" });
  }
  function approved(req, res) {
    res.render("cartdone");
  }
  function rejected(req, res) {
    res.render("cartrejected");
  }
  return { payWithCredit, verifyPayment, rejected, approved };
}

module.exports = paymentController;
