const {
    sendthemail
} = require("../services/mailServices");
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");
const sql = require("mssql");
var readTextFile = require('read-text-file');
const nodemailer = require("nodemailer");
var fs = require('fs');
const multer = require('multer');
const fse = require('fs-extra');
var limit = require("simple-rate-limiter");
var request = require("request");
const uuidv4 = require('uuid/v4');



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
    auth: {
        masterKey: masterKey
    }
});

const subscriptionKey = '2abd1a23e721419d9d0f52e641f940d4';
if (!subscriptionKey) {
    throw new Error('Environment variable for your subscription key is not set.')
};

const databaseId = "document";
const containerId = "localnews";

function dataContoller(documentservices, nav) {
    function getIndex(req, res) {


        res.render("upload");
        // console.log(detail);

    }

    function readFiles(dirname, onFileContent, onError) {
        dirname = `./public/documents/localnews`;
        let i = 1;
        fs.readdir(dirname, function (err, filenames) {
            if (err) {
                onError(err);
                return;
            }
            filenames.forEach(function (filename) {
                var contents = readTextFile.readSync(`./public/documents/localnews/${filename}`);
                var jsoncontents = contents.replace(/['"]+/g, '');
                jsoncontents = jsoncontents.split("<TEXT>").pop();
                jsoncontents = jsoncontents.replace('</TEXT>', '');
                jsoncontents = jsoncontents.replace('</DOC>', '');

                (async function analyze() {
                    translated = await translateText(jsoncontents, filename);

                })();


            });
        });
    }

    function translateText(originalText, filename) {
        var translated;
        var Ftranslation = 'empty';
        // setTimeout("console.log('hello')",1250);
        console.log('bye');
        let options = {
            method: 'POST',
            baseUrl: 'https://api.cognitive.microsofttranslator.com/',
            url: 'translate',
            qs: {
                'api-version': '3.0',
                'to': 'ar',
                'to': 'en'
            },
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            body: [{
                'text': `${originalText}`
            }],
            json: true,
        };

        request(options, function (err, res, body) {
            (async function translateAndSave() {
                // console.log(JSON.stringify(body, null, 4));
                translated = await body;
                console.log('translated1=' + translated);
                try {
                    console.log(translated);
                    if (translated == undefined) {
                        console.log('inIF');
                        fs.open('./public/documents/log.txt', 'a', 666, function (e, id) {
                            fs.write(id, `\n file:${filename}`, null, 'utf8', function () {
                                fs.close(id, function () {
                                    console.log('file closed');
                                });
                            });
                        });
                        fse.copySync(`./public/documents/localnews/${filename}`, `./public/documents/temp/${filename}`);

                    } else {
                        console.log('in else');
                        translation = await translated[0].translations[0].text;
                        category = "LocalNews";
                        const safedata = {
                            category,
                            originalText,
                            translation,
                            filename
                        };
                        const {
                            item,
                            id
                        } = await client
                            .database(databaseId)
                            .container(containerId)
                            .items.create(safedata);
                    }

                } catch (err) {
                    console.log(err.stack);
                    console.log('error File is:' + filename);
                }
            })();
        })



    };

    function uploadedfile(req, res) {
        let detail;
        let request;
        request = new sql.Request();

        const {
            id
        } = req.params;
        // var contentsPromise = readTextFile.read('./public/documents/read.txt');
        var contents = readTextFile.readSync(`./public/documents/${id}`);
        var jsoncontents = contents.replace(/['"]+/g, '');

        (async function analyze() {

            // request = await new sql.Request();
            // detail = await documentservices.analyzeDocument({
            //     data: jsoncontents
            // });
            // if(jsoncontents.indexOf('<TEXT>') >= 0){
            //     console.log('done')
            //    }
            jsoncontents = jsoncontents.split("<TEXT>").pop();
            jsoncontents = jsoncontents.replace('</TEXT>', '');
            jsoncontents = jsoncontents.replace('</DOC>', '');
            console.log(jsoncontents);
            // title = "Culture";
            // translated = await translateText(jsoncontents);
            // console.log('translation is:' + translated);
            try {
                // console.log(translated);


            } catch (error) {
                console.log(error.stack)
            }

        })();


    }

    return {
        getIndex,
        uploadedfile,
        readFiles
        // middleware
    };
}

module.exports = dataContoller;