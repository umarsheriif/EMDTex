const axios = require("axios");
const xml2js = require("xml2js");
const parser = xml2js.Parser({ explicitArray: false });

function goodreadsServices() {
  function getBookById(ccs) {
    console.log("Got into getbookby Id");
    return new Promise((resolve, reject) => {
      axios
        .post(
          "https://fraudapiemdt.azurewebsites.net/api/HttpTriggerJS1?code=jpJaIrblsqBBJ1KSxQkbirYYVc0oC3mAv2h71Djwg2bEzEnkTN/knw==",
          {
            creditcardstatus: ccs.status
          }
        )
        .then(response => {
          console.log("Got Into Then");
          console.log(response.data);
          resolve(response);
          // parser.parseString(response.data, (err, result) => {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     console.log(result);
          //     resolve(result.GoodreadsResponse.book);
          //   }
          // });
        })
        .catch(error => {
          reject(error);
          console.log(error);
        });
    });
  }
  return { getBookById };
}

module.exports = goodreadsServices();
