import {MosaicGenerator} from "./services/MosaicGenerator/MosaicGenerator";

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