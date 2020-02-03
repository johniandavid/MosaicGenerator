"use strict";
exports.__esModule = true;
var rgb_1 = require("./rgb");
var Jimp = require("jimp");
var mosaic_default_config_json_1 = require("./mosaic-default-config.json");
var JimpImage = /** @class */ (function () {
    function JimpImage(image) {
        this.image = image;
    }
    /**
     * Static method
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path
     */
    JimpImage.read = function (path) {
        return new Promise(function (resolve, reject) {
            Jimp.read(path, function (err, image) {
                if (err instanceof Error) {
                    //If this is the error, do not handle it as the api
                    //already tries to read the file twice
                    if (!err.message.includes('Invalid file signature')) {
                        console.log('throwing error');
                        reject(err);
                    }
                }
                if (!image) {
                    reject('Could not read image ' + path);
                }
                else {
                    resolve(image);
                }
            });
        });
    };
    /**
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path
     */
    JimpImage.prototype.read = function (path) {
        return JimpImage.read(path);
    };
    /**
     * Write the image to disk
     * @param imageName
     */
    JimpImage.prototype.save = function (imageName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var outputImageName = '';
            if (imageName) {
                outputImageName = imageName + '.jpg';
            }
            else {
                outputImageName = mosaic_default_config_json_1.CONFIG.output_image_name + '_' + new Date().getTime() + '.jpg';
            }
            _this.image.quality(50);
            _this.image.write(outputImageName, function (err, _) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(outputImageName);
                }
            });
        });
    };
    /**
     * Resize the image to the new width and height
     * @param newWidth
     * @param newHeight
     */
    JimpImage.prototype.resize = function (newWidth, newHeight) {
        this.image.resize(newWidth, newHeight);
    };
    /**
     * Paste the given image to the given x and y cords
     * @param image
     * @param x
     * @param y
     */
    JimpImage.prototype.composite = function (image, x, y) {
        if (image instanceof JimpImage) {
            var img = image;
            this.image.composite(img.image, x, y);
        }
        else {
            throw new Error('image is not an instance of JimpImage');
        }
    };
    /**
     * Get the average color of the specified area of the image
     * @param x_start left-top corner x cord of the area
     * @param y_start left-top corner y cord of the area
     * @param width width in pixels of the area
     * @param height height in pixels of the area
     */
    JimpImage.prototype.getAverageColor = function (x_start, y_start, width, height) {
        var _this = this;
        if (x_start === void 0) { x_start = 0; }
        if (y_start === void 0) { y_start = 0; }
        if (width === void 0) { width = this.image.bitmap.width; }
        if (height === void 0) { height = this.image.bitmap.height; }
        var self = this;
        return new Promise(function (resolve, reject) {
            var r = 0, g = 0, b = 0;
            var i = 0;
            _this.image.scan(x_start, y_start, width, height, function (x, y, idx) {
                r += self.image.bitmap.data[idx + 0];
                g += self.image.bitmap.data[idx + 1];
                b += self.image.bitmap.data[idx + 2];
                i++;
                if (x === (x_start + width) - 1 && y === (y_start + height) - 1) {
                    var red = Math.round(r / i);
                    var green = Math.round(g / i);
                    var blue = Math.round(b / i);
                    resolve(new rgb_1.RGB(red, green, blue));
                }
            });
        });
    };
    /**
     * Get the width in pixels of the image
     */
    JimpImage.prototype.getWidth = function () {
        return this.image.bitmap.width;
    };
    /**
     * Get the height in pixels of the image
     */
    JimpImage.prototype.getHeight = function () {
        return this.image.bitmap.height;
    };
    /**
     * Get the aspect ratio (width/height) of the image
     */
    JimpImage.prototype.getAspectRatio = function () {
        return this.getWidth() / this.getHeight();
    };
    return JimpImage;
}());
exports.JimpImage = JimpImage;
