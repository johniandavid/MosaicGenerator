"use strict";
exports.__esModule = true;
var Donation = /** @class */ (function () {
    function Donation(createdAt, display_name, amount, twitchUserId, channelId, profile_image_url) {
        this.createdAt = createdAt;
        this.display_name = display_name;
        this.amount = amount;
        this.channelId = channelId;
        this.profile_image_url = profile_image_url;
    }
    return Donation;
}());
exports.Donation = Donation;
