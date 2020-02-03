import {Donation} from "../../data/Donation";
import {Donations} from "../../data/Donations";
import {JimpImage} from "../../../libraries/mosaic-node-generator/src/jimp-image";
import {MosaicImage} from "../../../libraries/mosaic-node-generator/src/mosaic-image";
//import {mosaic} from "../../../libraries/mosaic-node-generator/index";

//const fs = require('fs');
//const https = require('https');
const fetch = require('node-fetch');

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

    async parseDonations(saved_donations) {
        let donations = new Donations(); //creates a Donations class that stores Donation data
        donations.donations_arr = saved_donations.donations.map(function (donation) {
            donations.addDonationAmount(donation.amount);
            return new Donation(donation.createdAt, donation.display_name, donation.amount, donation.twitchUserId, donation.channel_id, donation.profile_image_url);
        });

        let image_urls = donations.donations_arr.map(function(donation){
            return donation.profile_image_url;
        });
        const inputImage = new JimpImage(await JimpImage.read('./input/infants.jpg'));
        this.outputImageName = await new MosaicImage(inputImage,image_urls).generate()

    }

    generate(){
        fetchDonationJson(this.url).then(this.parseDonations)

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

const express = require( "express" );
const app = express();
const port = 1234;

var mosaicGenerator = new MosaicGenerator( "https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=1000&campaignLimit=0" ,'./input/infants.jpg'); //change url depending on when the buttons are clicked

app.get("/", (req, res) => {
    mosaicGenerator.generate();
});

app.use('/output/',express.static("./outputs" + mosaicGenerator.outputImageName));

app.listen(port, () => {
    console.log( `server started at http://localhost:${ port }`);
});