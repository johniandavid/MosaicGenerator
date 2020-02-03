"use strict";
exports.__esModule = true;
var RGB = /** @class */ (function () {
    function RGB(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    /**
     * Calculates the euclidean color distance with another color https://en.wikipedia.org/wiki/Color_difference
     * @param rgb
     */
    RGB.prototype.getColorDistance = function (rgb) {
        var diff_r = rgb.r - this.r;
        var diff_g = rgb.g - this.g;
        var diff_b = rgb.b - this.b;
        var distance = Math.sqrt(diff_r * diff_r + diff_g * diff_g + diff_b * diff_b);
        return distance;
    };
    return RGB;
}());
exports.RGB = RGB;
