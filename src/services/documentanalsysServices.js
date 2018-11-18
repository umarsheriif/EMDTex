const axios = require("axios");
const xml2js = require("xml2js");
const parser = xml2js.Parser({ explicitArray: false });

function documentanalsysServices() {
  function analyzeDocument(ccs) {
    console.log(ccs.data);
    console.log(
      "Calling the API, after getting on the Fraud detection services"
    );
    return new Promise((resolve, reject) => {
      axios
        .post("http://127.0.0.1:5000/api/v1/document/detector", {
          data:ccs.data
        })
        .then(response => {
          console.log("Got Into Then");
          resolve(response);
          console.log(response);
        })
        .catch(error => {
          reject(error);
          console.log(error);
        });
    });
  }
  return { analyzeDocument };
}

module.exports = documentanalsysServices();
