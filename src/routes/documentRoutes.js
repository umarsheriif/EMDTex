const express = require("express");
const multer = require('multer');
const upload = multer({
    dest: './public/documents/' // this saves your file into a directory called "uploads"
});
const documentRouter = express.Router();
const documentController = require("../controllers/documentController.js");
const documentServices = require("../services/documentanalsysServices.js");

function router(nav) {
    const { getIndex, uploadedfile } = documentController(documentServices,
        nav
    );
    //# We have to activate middle ware in order to check if the user is authenticated or not
    // dataRouter.use(middleware);
    documentRouter.route("/").get(getIndex);
    documentRouter.route("/uploadedfile/:id").get(uploadedfile);
    documentRouter.route("/upload").post(upload.single('file-to-upload'), (req, res) => {
        const encfile = req.file.filename;
        res.redirect('/document/uploadedfile/' + encfile);
    });
    // documentRouter.route("/upload").post(uploadfile);

    //   documentRouter.route("/checkout").get(letuspay);

    return documentRouter;
}

module.exports = router;
