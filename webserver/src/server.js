"use strict";
exports.__esModule = true;
var MosaicGenerator_1 = require("./services/MosaicGenerator/MosaicGenerator");
var express = require("express");
var app = express();
var port = 1234;
var mosaicGenerator = new MosaicGenerator_1.MosaicGenerator("https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=1000&campaignLimit=0", './input/infants.jpg'); //change url depending on when the buttons are clicked
app.get("/", function (req, res) {
    mosaicGenerator.generate();
});
app.use('/output/', express.static("./outputs" + mosaicGenerator.outputImageName));
app.listen(port, function () {
    console.log("server started at http://localhost:" + port);
});
