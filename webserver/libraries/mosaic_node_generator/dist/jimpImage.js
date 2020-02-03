"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jimp_1 = __importDefault(require("jimp"));
var JimpImage = /** @class */ (function () {
    function JimpImage(path) {
        this.image = jimp_1.default.read(path);
    }
    JimpImage.prototype.save = function (name) {
        console.log("do something");
    };
    return JimpImage;
}());
exports.default = JimpImage;
