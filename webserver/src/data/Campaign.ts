export class Campaign {
    channelId: string;
    createdAt: number;
    goal: number;
    amount: number;

    constructor(channelId : string, createdAt: number, goal : number, amount: number){
        this.channelId = channelId;
        this.createdAt = createdAt;
        this.goal = goal;
        this.amount = amount;
    }
}