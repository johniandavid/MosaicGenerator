import {Donation} from "../../data/Donation";
import {Donations} from "../../data/Donations";
import {mosaic} from "../../../libraries/mosaic-node-generator/index";

const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');
//const mosaic = require('mosaic-node-generator');
const express = require( "express" );



const app = express();
const port = 1234;

export class MosaicGenerator {
    url: string; //GameChangers database API endpoint
    filePath: string; //Path to the final image
    outputImageName : string;

    constructor(url:string, filePath: string){
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

    parseDonations(saved_donations) {
        let donations = new Donations(); //creates a Donations class that stores Donation data
        donations.donations_arr = saved_donations.donations.map(function (donation) {
            donations.addDonationAmount(donation.amount);
            return new Donation(donation.createdAt, donation.display_name, donation.amount, donation.twitchUserId, donation.channel_id, donation.profile_image_url);
        });

        for (let i = 0; i < donations.donations_arr.length; i++) {
            saveImageToDisk(donations.donations_arr[i].profile_image_url, "./input/tilesDirectory/" + "input-image-" + (i + 1) + ".jpg");
        }
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generate(){
        fetchDonationJson(this.url).then(this.parseDonations);
        this._sleep(10000)
            .then(() => {
                mosaic(this.filePath, './input/tilesDirectory').then( function (res) {
                    this.outputImageName = res;
                    console.log(this.outputImageName);
                    })
            });
    }
}

/**
 * Fetches the donation data from the GameChangers API endpoint and stores it in an Array
 * @param url : string (The API endpoint)
 * @return Promise
 */
function fetchDonationJson(url : string){
    return new Promise(function (resolve, reject) {
        fetch(url)
            .then(response => response.json())
            .then(body => {
                resolve(body);
            });
    });
}

/**
 * Fetches the images from the Donations objects and saves them to a local directory
 * @param profile_image_url : string (profile image)
 * @param localPath : string (path to tilesDirectory)
 */
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

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get("/", (req, res) => {
    let mosaicGenerator = new MosaicGenerator( "https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=1000&campaignLimit=0" ,'./input/infants.jpg');
    mosaicGenerator.generate();
    //res.send(this.outputImageName);
});

app.use('/output',express.static("./outputs"));

app.listen(port, () => {
    console.log( `server started at http://localhost:${ port }`);
});