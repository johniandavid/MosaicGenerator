import {Donation} from "../../data/Donation";
import {Donations} from "../Donations/Donations";

//const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');
//const mosaic = require('mosaic-node-generator');

export class MosaicGenerator {
    url: string //GameChangers database API endpoint
    filePath: string //Path to the final image

    constructor(url:string, filePath: string){
        this.url = url;
        this.filePath = './input/infants.jpg';
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generate(){
        fetchDonationJson(this.url).then(this.parseDonations);
        this.sleep(10000)
            .then(() => {
                //mosaic.mosaic(this.filePath, './input/tilesDirectory');
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
            //response.pipe(fs.createWriteStream(localPath));
            console.log("File Name: " + localPath + " Url: " + profile_image_url + " statusCode: ", response.statusCode);
        }
    }).on('error', function (e) {
        console.log(e);
    });
}


//let m =  new MosaicGenerator();
//m.generate();