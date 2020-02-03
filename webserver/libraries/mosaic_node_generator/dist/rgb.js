"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RGB = /** @class */ (function () {
    function RGB(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    RGB.prototype.getColorDistance = function (rgb) {
        var rDiff = rgb.r - this.r;
        var gDiff = rgb.g - this.g;
        var bDiff = rgb.b - this.b;
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    };
    return RGB;
}());
exports.default = RGB;
