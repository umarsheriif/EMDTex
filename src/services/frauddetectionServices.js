const axios = require("axios");
const xml2js = require("xml2js");
const parser = xml2js.Parser({ explicitArray: false });

function frauddetectionServices() {
  function checkIfFraud(ccs) {
    console.log(ccs);
    console.log(
      "Calling the API, after getting on the Fraud detection services"
    );
    return new Promise((resolve, reject) => {
      axios
        .post("http://40.87.13.76/api/v1/fraud/detector", {
          age: ccs.Cage,
          gender: ccs.Cgender,
          zipCustomer: ccs.zipCustomer,
          merchantID: ccs.merchantID,
          zipMerchant: ccs.zipMerchant,
          category: ccs.category,
          amount: ccs.Tamount
        })
        .then(response => {
          console.log("Got Into Then");
          resolve(response);
          console.log('resolved');
        })
        .catch(error => {
          reject(error);
          console.log(error);
        });
    });
  }
  return { checkIfFraud };
}

module.exports = frauddetectionServices();
