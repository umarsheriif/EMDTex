module.exports = function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  if (req.body) {
    if (req.body.creditcard == "valid") {
      context.res = {
        // status: 200, /* Defaults to 200 */
        TransactionMsg: "Must be canceled",
        Reason: "Payee is fraud",
        status: "failed",
        details: {
          reqbody: req.body
        }
      };
    } else if (req.body.creditcardstatus == "good") {
      context.res = {
        // status: 200, /* Defaults to 200 */
        TransactionMsg: "Good Transaction",
        Reason: "Payee is safe",
        status: "Done"
      };
    }
  } else {
    context.res = {
      status: 400,
      body: "Please pass a name on the query string or in the request body"
    };
  }
  context.done();
};
