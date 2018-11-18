const { sendthemail } = require("../services/mailServices");
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");
const sql = require("mssql");
var readTextFile = require('read-text-file');
const nodemailer = require("nodemailer");
const multer = require('multer');
const upload = multer({
    dest: './public/documents/' // this saves your file into a directory called "uploads"
});
var datetime = require('node-datetime');
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

function dataContoller(documentservices, nav) {
    function getIndex(req, res) {


        res.render("upload");
        // console.log(detail);

    }

    function uploadedfile(req, res) {
        let detail;
        let request;
        request = new sql.Request();

        const { id } = req.params;
        // var contentsPromise = readTextFile.read('./public/documents/read.txt');
        var contents = readTextFile.readSync(`./public/documents/${id}`);
        var jsoncontents = contents.replace(/['"]+/g, '');

        (async function analyze() {

            request = await new sql.Request();
            detail = await documentservices.analyzeDocument({
                data: jsoncontents
            });
            try {
                console.log('error1');
                request
                    .query(
                        `insert into document (documentNo, documentType,documentData) values ('${id}','${detail.data.Movie}','${jsoncontents}')`
                    )
                    .then(documentdata => {
                        console.log('error1');

                        res.redirect("/data/document")
                    });
            }
            catch (error) { console.log(error.stack) }

        })();


    }

    return {
        getIndex,
        uploadedfile
        // middleware
    };
}

module.exports = dataContoller;
