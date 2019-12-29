export class Donation {
    createdAt: number
    display_name: string
    amount: number
    twitchUserId: string
    channelId: string
    profile_image_url: string
    transactionId: string
    message: string

    constructor(createdAt : number, display_name: string, amount: number, twitchUserId: string, channelId: string, profile_image_url: string){
        this.createdAt = createdAt;
        this.display_name = display_name;
        this.amount = amount;
        this.channelId = channelId;
        this.profile_image_url = profile_image_url;
    }
}