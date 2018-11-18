const nodemailer = require("nodemailer");
const xml2js = require("xml2js");
const parser = xml2js.Parser({ explicitArray: false });

function initMail() {
  function sendthemail(min,mailbody) {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "umarsheriif@gmail.com", // generated ethereal user
        pass: "seekegyptUu123456.." // generated ethereal password
      },
      tls:{
        ciphers:'SSLv3'
      }
    });
    // setup email data with unicode symbols
    let mailOptions = {
      from: min + "<foo@example.com>", // sender address
      to: "v-omsher@microsoft.com", // list of receivers
      subject: mailbody, // Subject line
      text: mailbody // plain text body
      //   html: min // html body
    };
    return { mailOptions, transporter };
  }

  return { sendthemail };
}

module.exports = initMail();
