/*
import {MosaicGenerator} from "./services/MosaicGenerator/MosaicGenerator";

const express = require( "express" );
const app = express();
const port = 8080;



app.get("/", ( req, res ) => {
    res.send( "Hello world!" );
});

app.get("/generate", (req, res) => {
    let mosaicGenerator = new MosaicGenerator( "https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=10&campaignLimit=0" ,'./input/infants.jpg');
    mosaicGenerator.generate();
    res.send();
});

app.listen(port, () => {
    console.log( `server started at http://localhost:${ port }` );
});
*/
