"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var mosaic_default_config_json_1 = require("./mosaic-default-config.json");
var jimp_image_1 = require("./jimp-image");
var fs = require("fs");
var TileIndexAndDifference = /** @class */ (function () {
    function TileIndexAndDifference(tileInd, diff) {
        this.tileInd = tileInd;
        this.diff = diff;
    }
    return TileIndexAndDifference;
}());
var MosaicImage = /** @class */ (function () {
    function MosaicImage(image, tilesDirectory, cellWidth, cellHeight, columns, rows, thumbsDirectoryFromRead, thumbsDirectoryToWrite, enableConsoleLogging) {
        if (enableConsoleLogging === void 0) { enableConsoleLogging = true; }
        //The tiles (converted to thumbs of cellWidth * cellHeight px) read from the tiles folder or the thumbs one
        this.tiles = [];
        //This matrix stores in each cell the index of the tile that will be composed in that cell in the final image
        //Used in order not to repeat the same cells in a given area
        this.tilesIndexMatrix = [];
        this.image = image;
        this.tilesDirectory = tilesDirectory ? tilesDirectory : mosaic_default_config_json_1.CONFIG.tiles_directory;
        this.cellWidth = cellWidth ? cellWidth : mosaic_default_config_json_1.CONFIG.cell_width;
        this.cellHeight = cellHeight ? cellHeight : mosaic_default_config_json_1.CONFIG.cell_height;
        this.columns = columns ? columns : mosaic_default_config_json_1.CONFIG.columns;
        this.rows = rows ? rows : mosaic_default_config_json_1.CONFIG.rows;
        this.thumbsDirectoryFromRead = thumbsDirectoryFromRead ? thumbsDirectoryFromRead : null;
        this.thumbsDirectoryToWrite = thumbsDirectoryToWrite ? thumbsDirectoryToWrite : null;
        this.enableConsoleLogging = enableConsoleLogging;
        this.outputImageName = "";
        this._prepare();
    }
    /**
     * Recalculate columns and rows depending on the aspect ratio of the image
     * Resize the final image depending on the cell width and height, rows, columns...
     */
    MosaicImage.prototype._prepare = function () {
        var imageWidth = this.image.getWidth();
        var imageHeight = this.image.getHeight();
        var virtualCols = Math.ceil(imageWidth / this.cellWidth);
        var virtualRows = Math.ceil(imageHeight / this.cellHeight);
        //If calculated columns are greater than the default ones, we use the calculated sizes
        if (virtualCols > this.columns) {
            this.columns = virtualCols;
            this.rows = virtualRows;
        }
        else {
            //We recalculate columns or rows depending on the aspect ratio, because we are making the final image bigger
            if (this.image.getAspectRatio() > 1) {
                this.columns = Math.ceil(this.columns * this.image.getAspectRatio());
            }
            else if (this.image.getAspectRatio() < 1) {
                this.rows = Math.ceil(this.rows * (2 - this.image.getAspectRatio()));
            }
        }
        var finalImageWidth = this.cellWidth * this.columns;
        var finalImageHeight = this.cellHeight * this.rows;
        this.image.resize(finalImageWidth, finalImageHeight);
    };
    /**
     * Helps calculate progress percentajes
     * @param currentRow
     * @param totalRows
     */
    MosaicImage.prototype._calcProgress = function (current, total) {
        return Math.round(((current / total) * 100) * 100) / 100;
    };
    /**
     * Basically reads all the tiles (pictures) from a folder, parses them as 'Image' objects and stores in the 'tiles' attribute
     * @param tilesDirectory
     */
    MosaicImage.prototype._readTiles = function (tilesDirectory) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _tilesDir = tilesDirectory ? tilesDirectory : _this.tilesDirectory;
            var numberOfTiles = fs.readdirSync(_tilesDir).length;
            if (numberOfTiles === 0) {
                throw new Error('There are no tiles in the directory ' + _tilesDir);
            }
            if (_this.enableConsoleLogging)
                console.log(new Date().toString() + " - Reading tiles from " + _tilesDir + ", " + numberOfTiles + " found...");
            var i = 0;
            fs.readdirSync(_tilesDir).forEach(function (tile) { return __awaiter(_this, void 0, void 0, function () {
                var img, image;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, jimp_image_1.JimpImage.read(_tilesDir + '/' + tile)["catch"](function (err) { if (_this.enableConsoleLogging)
                                console.log('Warning: aborting read of ' + tile); })];
                        case 1:
                            img = _a.sent();
                            if (this.enableConsoleLogging)
                                console.log(new Date().toString() + " - [Tiles read] " + i + "/" + numberOfTiles + ". Progress: " + this._calcProgress(i, numberOfTiles) + "%");
                            if (img) {
                                image = new jimp_image_1.JimpImage(img);
                                image.resize(this.cellWidth, this.cellHeight);
                                this.tiles.push(image);
                                i++;
                            }
                            else {
                                i++;
                            }
                            if (i === numberOfTiles) {
                                if (this.enableConsoleLogging)
                                    console.log(new Date().toString() + " - Finished reading tiles.");
                                resolve(this.tiles);
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    /**
     * If attribute 'thumbsDirectoryFromRead' is true, it reads tiles as thumbs from the given thumbs folder
     * It does not resize them as they are supposed to be already thumbnails
     */
    MosaicImage.prototype._readThumbs = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.thumbsDirectoryFromRead) {
                var i_1 = 0;
                try {
                    var numberOfThumbs_1 = fs.readdirSync(_this.thumbsDirectoryFromRead).length;
                    if (numberOfThumbs_1 === 0) {
                        throw new Error('There are no thumbs in the directory ' + _this.thumbsDirectoryFromRead);
                    }
                    if (_this.enableConsoleLogging)
                        console.log(new Date().toString() + " - Reading thumbs from " + _this.thumbsDirectoryFromRead + ", " + numberOfThumbs_1 + " found...");
                    fs.readdirSync(_this.thumbsDirectoryFromRead).forEach(function (thumb) { return __awaiter(_this, void 0, void 0, function () {
                        var img, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, jimp_image_1.JimpImage.read(this.thumbsDirectoryFromRead + '/' + thumb)["catch"](function (err) { return console.log('Warning: aborting read of ' + thumb); })];
                                case 1:
                                    img = _a.sent();
                                    if (img) {
                                        image = new jimp_image_1.JimpImage(img);
                                        this.tiles.push(image);
                                        i_1++;
                                    }
                                    else {
                                        i_1++;
                                    }
                                    if (i_1 === numberOfThumbs_1 - 1) {
                                        if (this.enableConsoleLogging)
                                            console.log(new Date().toString() + " - Finished reading thumbs");
                                        resolve(this.tiles);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                catch (err) {
                    reject(err);
                }
            }
            else {
                throw new Error('Thumb directory not specified');
            }
        });
    };
    /**
     * Saves the tiles in the 'thumbsDirectoryToWrite' folder, so we can use them later in order to save time
     */
    MosaicImage.prototype.generateThumbs = function () {
        if (this.thumbsDirectoryToWrite) {
            if (this.enableConsoleLogging)
                console.log(new Date().toString() + " Start saving thumbs to " + this.thumbsDirectoryToWrite + "...");
            var i = 0;
            var n = this.tiles.length;
            for (var _i = 0, _a = this.tiles; _i < _a.length; _i++) {
                var tile = _a[_i];
                if (this.enableConsoleLogging)
                    console.log(new Date().toString() + " - [Thumbs save] " + i + "/" + n + ". Progress: " + this._calcProgress(i, n) + "%");
                tile.save(this.thumbsDirectoryToWrite + "/thumb-" + i);
                i++;
            }
            if (this.enableConsoleLogging)
                console.log(new Date().toString() + " End saving thumbs! --> " + this.thumbsDirectoryToWrite);
        }
    };
    /**
     * Decides to read the tiles or read the thumbnails
     * @param tilesDirectory
     */
    MosaicImage.prototype.readTiles = function (tilesDirectory) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.thumbsDirectoryFromRead) {
                _this._readThumbs().then(function (imgs) { return resolve(imgs); })["catch"](function (err) { return reject(err); });
            }
            else {
                _this._readTiles(tilesDirectory).then(function (imgs) { return resolve(imgs); })["catch"](function (err) { return reject(err); });
            }
        });
    };
    /**
     * This is the core function. For each cell (row,col) of the image, it calculates the average color of that zone
     * Then, it calculates the best tile that suits in that zone calculating the difference within all the tiles
     * When we know which tile we will use for that zone, we "paste" that tile in our output image, in the appropiate coords
     * @param rowStart
     * @param colStart
     * @param numRows
     * @param numCols
     */
    MosaicImage.prototype.processRowsAndColumns = function (rowStart, colStart, numRows, numCols) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _loop_1, row;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.enableConsoleLogging)
                            console.log(new Date().toString() + " - Generating mosaic from (" + rowStart + ", " + colStart + ") to (" + (rowStart + numRows) + ", " + (colStart + numCols) + ")");
                        _loop_1 = function (row) {
                            var _processColsForRow;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _processColsForRow = function () { return __awaiter(_this, void 0, void 0, function () {
                                            var col, imageAvgColor, bestTile;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        console.log("- " + new Date().toString() + " - [Mosaic creation]. Progress: " + this._calcProgress(row, numRows) + "%");
                                                        col = colStart;
                                                        _a.label = 1;
                                                    case 1:
                                                        if (!(col < numCols)) return [3 /*break*/, 5];
                                                        return [4 /*yield*/, this.image.getAverageColor(col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight)];
                                                    case 2:
                                                        imageAvgColor = _a.sent();
                                                        return [4 /*yield*/, this.getBestTileForImage(imageAvgColor, row, col)];
                                                    case 3:
                                                        bestTile = _a.sent();
                                                        //Composite the calculated tile in the final image
                                                        this.image.composite(bestTile, col * this.cellWidth, row * this.cellHeight);
                                                        _a.label = 4;
                                                    case 4:
                                                        col++;
                                                        return [3 /*break*/, 1];
                                                    case 5:
                                                        Promise.resolve();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); };
                                        return [4 /*yield*/, _processColsForRow()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        row = rowStart;
                        _a.label = 1;
                    case 1:
                        if (!(row < numRows)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(row)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        row++;
                        return [3 /*break*/, 1];
                    case 4:
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Calculates the best tile for the given RGB colour. It compares the given rgb colour with all the tiles and decides which one is more suitable
     * The algorithm also tries to prevent the use of the same thumb in a too close area
     * @param imageAvgColor
     * @param row
     * @param col
     */
    MosaicImage.prototype.getBestTileForImage = function (imageAvgColor, row, col) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!imageAvgColor) {
                throw new Error('No image provided');
            }
            else {
                var tilesDiff_1 = [];
                var _getBestTileForImage = function () { return __awaiter(_this, void 0, void 0, function () {
                    var i, tile, rgb, diff, j, found, IMGAREA, r, c, bestTile;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < this.tiles.length)) return [3 /*break*/, 4];
                                tile = this.tiles[i];
                                return [4 /*yield*/, tile.getAverageColor(0, 0, this.cellWidth, this.cellHeight)];
                            case 2:
                                rgb = _a.sent();
                                diff = imageAvgColor.getColorDistance(rgb);
                                tilesDiff_1.push(new TileIndexAndDifference(i, diff));
                                _a.label = 3;
                            case 3:
                                i++;
                                return [3 /*break*/, 1];
                            case 4:
                                //Sort the array (smaller differences first)
                                tilesDiff_1 = tilesDiff_1.sort(function (tile1, tile2) {
                                    if (tile1.diff > tile2.diff) {
                                        return 1;
                                    }
                                    if (tile1.diff < tile2.diff) {
                                        return -1;
                                    }
                                    return 0;
                                });
                                //If row does not exist in matrix, create it
                                if (!this.tilesIndexMatrix[row]) {
                                    this.tilesIndexMatrix.push([]);
                                }
                                j = -1;
                                found = false;
                                IMGAREA = mosaic_default_config_json_1.CONFIG.area_prevent_same_images;
                                do {
                                    found = true;
                                    //We check if the tile we are testing exists in an IMGAREA*IMGAREA area around the current cell
                                    for (r = (row - IMGAREA) + 1; r < (row + IMGAREA); r++) {
                                        for (c = (col - IMGAREA) + 1; c < (col + IMGAREA); c++) {
                                            if (this.tilesIndexMatrix[r] && this.tilesIndexMatrix[r][c] && this.tilesIndexMatrix[r][c] === tilesDiff_1[j + 1].tileInd) {
                                                found = false;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            break;
                                        }
                                    }
                                    j++;
                                } while (!found);
                                bestTile = this.tiles[tilesDiff_1[j].tileInd];
                                this.tilesIndexMatrix[row][col] = tilesDiff_1[j].tileInd;
                                resolve(bestTile);
                                return [2 /*return*/];
                        }
                    });
                }); };
                _getBestTileForImage();
            }
        });
    };
    /**
     * 1. Read the tiles from disk
     * 2. Process the image (calculate the tiles for each cell in the image)
     * 3. Save the image in disk
     */
    MosaicImage.prototype.generate = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _generate = function () { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: 
                        //First, we read the tiles from disk
                        return [4 /*yield*/, this.readTiles()["catch"](function (err) { return Promise.reject(err); })];
                        case 1:
                            //First, we read the tiles from disk
                            _b.sent();
                            if (!(this.tiles.length > 0)) return [3 /*break*/, 4];
                            //Then we process the image and generate the mosaic
                            return [4 /*yield*/, this.processRowsAndColumns(0, 0, this.rows, this.columns)["catch"](function (err) { return Promise.reject(err); })];
                        case 2:
                            //Then we process the image and generate the mosaic
                            _b.sent();
                            console.log('Saving mosaic image...');
                            //Save the image in disk
                            _a = this;
                            return [4 /*yield*/, this.image.save()["catch"](function (err) { return Promise.reject(err); })];
                        case 3:
                            //Save the image in disk
                            _a.outputImageName = _b.sent();
                            if (this.enableConsoleLogging)
                                console.log('Mosaic image saved! --> ' + this.outputImageName);
                            //Finally we generate the thumbs folder in order to save time in following executions
                            this.generateThumbs();
                            resolve();
                            return [3 /*break*/, 5];
                        case 4:
                            reject("Tiles were not loaded");
                            _b.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
            _generate()["catch"](function (err) { reject(err); });
        });
    };
    return MosaicImage;
}());
exports.MosaicImage = MosaicImage;