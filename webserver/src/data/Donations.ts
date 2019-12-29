import {Donation} from "./Donation";

export class Donations{
    donations_arr: Donation[];
    currentDonationAmount : number;

    constructor(){
        this.donations_arr = new Array();
        this.currentDonationAmount = 0;
    }

    addDonationAmount(amount : number) : void{
        this.currentDonationAmount += amount;
    }
}