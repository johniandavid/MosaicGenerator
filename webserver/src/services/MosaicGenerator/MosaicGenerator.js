"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Donation_1 = require("../../data/Donation");
var Donations_1 = require("../../data/Donations");
var jimp_image_1 = require("../../../libraries/mosaic-node-generator2/src/jimp-image");
var mosaic_image_1 = require("../../../libraries/mosaic-node-generator2/src/mosaic-image");
//import {mosaic} from "../../../libraries/mosaic-node-generator/index";
var fs = require('fs');
var https = require('https');
var fetch = require('node-fetch');
var MosaicGenerator = /** @class */ (function () {
    function MosaicGenerator(url, filePath) {
        this.url = url;
        this.filePath = filePath;
        this.outputImageName = "";
    }
    /**
     * Runs after fetchDonationJson fetches the Donation objects from the API endpoint
     * and saves it as an object (dictionary)
     * Creates a Donation object from the Json attributes. The new Donation objects are stored in an array in the Donations container class
     *
     * @param saved_donations : object (dictionary)
     */
    MosaicGenerator.prototype.parseDonations = function (saved_donations) {
        return __awaiter(this, void 0, void 0, function () {
            var donations, image_urls, inputImage, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        donations = new Donations_1.Donations();
                        donations.donations_arr = saved_donations.donations.map(function (donation) {
                            donations.addDonationAmount(donation.amount);
                            return new Donation_1.Donation(donation.createdAt, donation.display_name, donation.amount, donation.twitchUserId, donation.channel_id, donation.profile_image_url);
                        });
                        image_urls = donations.donations_arr.map(function (donation) {
                            return donation.profile_image_url;
                        });
                        _a = jimp_image_1.JimpImage.bind;
                        return [4 /*yield*/, jimp_image_1.JimpImage.read('./input/infants.jpg')];
                    case 1:
                        inputImage = new (_a.apply(jimp_image_1.JimpImage, [void 0, _b.sent()]))();
                        return [4 /*yield*/, new mosaic_image_1.MosaicImage(inputImage, image_urls).generate()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
     */
    MosaicGenerator.prototype.generate = function () {
        fetchDonationJson(this.url).then(this.parseDonations);
        /**
        this.sleep(10000)
            .then(() => {
                mosaic(this.filePath, './input/tilesDirectory')
            });
         */
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
 * Fetches the images from the Donations objects and saves them to a local directory. CHANGE WHEN WE UPDATE THE MOSAIC GENERATOR BC
 * WE DONT NEED TO SAVE TO A DIRECTORY.
 * @param profile_image_url : string (profile image)
 * @param localPath : string (path to tilesDirectory)
 */
/**
function saveImageToDisk(profile_image_url: string, localPath: string) {
    https.get(profile_image_url, function (response) {
        if (response.statusCode == 200) {
            response.pipe(fs.createWriteStream(localPath));
            console.log("File Name: " + localPath + " Url: " + profile_image_url + " statusCode: ", response.statusCode);
        }
    }).on('error', function (e) {
        console.log(e);
    });
}
*/
var express = require("express");
var app = express();
var port = 1234;
var mosaicGenerator = new MosaicGenerator("https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=1000&campaignLimit=0", './input/infants.jpg'); //change url depending on when the buttons are clicked
app.get("/", function (req, res) {
    mosaicGenerator.generate();
});
app.use('/output/', express.static("./outputs" + mosaicGenerator.outputImageName));
app.listen(port, function () {
    console.log("server started at http://localhost:" + port);
});
