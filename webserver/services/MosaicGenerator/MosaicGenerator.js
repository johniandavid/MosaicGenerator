"use strict";
exports.__esModule = true;
var Donation_1 = require("../../../client/src/data/Donation");
var Donations_1 = require("../../../client/src/util/Donations/Donations");
var fs = require('fs');
var https = require('https');
var fetch = require('node-fetch');
var mosaic = require('mosaic-node-generator');
var express = require("express");
var app = express();
var port = 1234;
var MosaicGenerator = /** @class */ (function () {
    function MosaicGenerator(url, filePath) {
        this.url = url;
        this.filePath = filePath;
    }
    /**
     * Runs after fetchDonationJson fetches the Donation objects from the API endpoint
     * and saves it as an object (dictionary)
     * Creates a Donation object from the Json attributes. The new Donation objects are stored in an array in the Donations container class
     *
     * @param saved_donations : object (dictionary)
     */
    MosaicGenerator.prototype.parseDonations = function (saved_donations) {
        var donations = new Donations_1.Donations(); //creates a Donations class that stores Donation data
        donations.donations_arr = saved_donations.donations.map(function (donation) {
            donations.addDonationAmount(donation.amount);
            return new Donation_1.Donation(donation.createdAt, donation.display_name, donation.amount, donation.twitchUserId, donation.channel_id, donation.profile_image_url);
        });
        for (var i = 0; i < donations.donations_arr.length; i++) {
            saveImageToDisk(donations.donations_arr[i].profile_image_url, "./input/tilesDirectory/" + "input-image-" + (i + 1) + ".jpg");
        }
    };
    MosaicGenerator.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    MosaicGenerator.prototype.generate = function () {
        var _this = this;
        fetchDonationJson(this.url).then(this.parseDonations);
        this.sleep(10000)
            .then(function () {
            mosaic.mosaic(_this.filePath, './input/tilesDirectory');
        });
    };
    return MosaicGenerator;
}());
exports.MosaicGenerator = MosaicGenerator;
/**
 * Fetches the donation data from the GameChangers API endpoint and stores it in an Array
 * @param url : string (The API endpoint)
 * @return Promise
 */
function fetchDonationJson(url) {
    return new Promise(function (resolve, reject) {
        fetch(url)
            .then(function (response) { return response.json(); })
            .then(function (body) {
            resolve(body);
        });
    });
}
/**
 * Fetches the images from the Donations objects and saves them to a local directory
 * @param profile_image_url : string (profile image)
 * @param localPath : string (path to tilesDirectory)
 */
function saveImageToDisk(profile_image_url, localPath) {
    https.get(profile_image_url, function (response) {
        if (response.statusCode == 200) {
            response.pipe(fs.createWriteStream(localPath));
            console.log("File Name: " + localPath + " Url: " + profile_image_url + " statusCode: ", response.statusCode);
        }
    }).on('error', function (e) {
        console.log(e);
    });
}
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
app.get("/", function (req, res) {
    var mosaicGenerator = new MosaicGenerator("https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=1000&campaignLimit=0", './input/infants.jpg');
    mosaicGenerator.generate();
    res.send("Hello world!");
});
app.use('/output', express.static("./outputs"));
app.listen(port, function () {
    console.log("server started at http://localhost:" + port);
});
//let mosaicGenerator = new MosaicGenerator( "https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=10&campaignLimit=0" ,'./input/infants.jpg');//
//mosaicGenerator.generate();
