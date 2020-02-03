import { CONFIG } from './mosaic-default-config.json';
import { JimpImage } from './jimp-image';
import { Image } from './image';
import { RGB } from './rgb';

class TileIndexAndDifference {
  public tileInd: number;
  public diff: number;

  constructor(tileInd: number, diff: number) {
    this.tileInd = tileInd;
    this.diff = diff;
  }
}

export class MosaicImage {
  // The output image that will be created as mosaic
  public image: Image;
  // The URL Paths to the images to be used in the mosaic
  public urls: string[];
  // The width in pixels of each cell of the final image
  public cellWidth: number;
  // The height in pixels of each cell of the final image
  public cellHeight: number;
  // The number of columns of the final image
  public columns: number;
  // The number of rows of the final image
  public rows: number;
  // The images that will make up the final image (converted to cellWidth and cellHeight)
  public tiles: Image[] = [];
  // Index of best tile for a given cell
  public tilesIndexMatrix: number[][] = [];
  // Enables messages printed to the console
  public enableConsoleLogging: boolean;

  constructor(
    image: Image,
    urls: string[],
    cellWidth?: number,
    cellHeight?: number,
    columns?: number,
    rows?: number,
    enableConsoleLogging: boolean = true
  ) {
    this.image = image;
    this.urls = urls;
    this.cellWidth = cellWidth ? cellWidth : CONFIG.cell_width;
    this.cellHeight = cellHeight ? cellHeight : CONFIG.cell_height;
    this.columns = columns ? columns : CONFIG.columns;
    this.rows = rows ? rows : CONFIG.rows;
    this.enableConsoleLogging = enableConsoleLogging;
    this._prepare();
  }

  private _prepare() {
    let imageWidth = this.image.getWidth();
    let imageHeight = this.image.getHeight();
    let virtualCols = Math.ceil(imageWidth / this.cellWidth);
    let virtualRows = Math.ceil(imageHeight / this.cellHeight);

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

    let finalImageWidth = this.cellWidth * this.columns;
    let finalImageHeight = this.cellHeight * this.rows;
    this.image.resize(finalImageWidth, finalImageHeight);
  }

  /**
   * Helps calculate progress percentajes
   * @param currentRow
   * @param totalRows
   */
  private _calcProgress(current: number, total: number) {
    return Math.round(((current / total) * 100) * 100) / 100;
  }

  public getTiles(urls?: string[]): Promise<Image[]> {
    return new Promise<Image[]>((resolve, reject) => {
      let _urls = urls ? urls : this.urls;
      let numberOfTiles = _urls.length;
      if (numberOfTiles === 0) {
        throw new Error('There are no URLS');
      }
      if (this.enableConsoleLogging) console.log(`${new Date().toString()} - Reading tiles from URLS, ${numberOfTiles} found...`);
      let i = 0;
      _urls.forEach(async (url) => {
        let img = await JimpImage.read(url).catch((err) => { if (this.enableConsoleLogging) console.log(`Warning: abourting read of ${url}`) });
        if (this.enableConsoleLogging) console.log(`${new Date().toString()} - [Tiles read] ${i}/${numberOfTiles}. Progress: ${this._calcProgress(i, numberOfTiles)}%`);
        if (img) {
          let image: Image = new JimpImage(img);
          image.resize(this.cellWidth, this.cellHeight);
          this.tiles.push(image);
          i++;
        }
        else {
          i++;
        } if (i === numberOfTiles) {
          if (this.enableConsoleLogging) console.log(`${new Date().toString()} - Finished reading tiles.`);
          resolve(this.tiles);
        }
      })
    })
  }

  /**
   * This is the core function. For each cell (row,col) of the image, it calculates the average color of that zone
   * Then, it calculates the best tile that suits in that zone calculating the difference within all the tiles
   * When we know which tile we will use for that zone, we "paste" that tile in our output image, in the appropiate coords
   * @param rowStart
   * @param colStart
   * @param numRows
   * @param numCols
   */
  public processRowsAndColumns(rowStart: number, colStart: number, numRows: number, numCols: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.enableConsoleLogging) console.log(`${new Date().toString()} - Generating mosaic from (${rowStart}, ${colStart}) to (${rowStart + numRows}, ${colStart + numCols})`);
      for (let row = rowStart; row < numRows; row++) {
        const _processColsForRow = async (): Promise<any> => {
          console.log(`- ${new Date().toString()} - [Mosaic creation]. Progress: ${this._calcProgress(row, numRows)}%`);
          for (let col = colStart; col < numCols; col++) {
            //Get average color of the current cell
            let imageAvgColor: RGB = await this.image.getAverageColor(col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight);
            //Get the best tile from our tiles array for this average color
            let bestTile: Image = await this.getBestTileForImage(imageAvgColor, row, col);
            //Composite the calculated tile in the final image
            this.image.composite(bestTile, col * this.cellWidth, row * this.cellHeight);
          }
          Promise.resolve();
        };
        await _processColsForRow();
      }
      resolve();
    });
  }

  /**
   * Calculates the best tile for the given RGB colour. It compares the given rgb colour with all the tiles and decides which one is more suitable
   * The algorithm also tries to prevent the use of the same thumb in a too close area
   * @param imageAvgColor
   * @param row
   * @param col
   */
  public getBestTileForImage(imageAvgColor: RGB, row: number, col: number): Promise<Image> {
    return new Promise((resolve, reject) => {
      if (!imageAvgColor) {
        throw new Error('No image provided');
      }
      else {
        let tilesDiff: TileIndexAndDifference[] = [];
        const _getBestTileForImage = async () => {
          //Create an array of the differences between the given rgb and all the tiles
          for (let i = 0; i < this.tiles.length; i++) {
            let tile: Image = this.tiles[i];
            let rgb: RGB = await tile.getAverageColor(0, 0, this.cellWidth, this.cellHeight);
            let diff: number = imageAvgColor.getColorDistance(rgb);
            tilesDiff.push(new TileIndexAndDifference(i, diff));
          }
          //Sort the array (smaller differences first)
          tilesDiff = tilesDiff.sort((tile1, tile2) => {
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

          /**
           * Code below is what "chooses" what tile is more suitable for the current cell
           * It prevents using the same tiles too close (in a specified area around the current cell)
           */
          let j: number = -1;
          let found: boolean = false;
          let IMGAREA: number = CONFIG.area_prevent_same_images;
          do {
            found = true;
            //We check if the tile we are testing exists in an IMGAREA*IMGAREA area around the current cell
            for (let r = (row - IMGAREA) + 1; r < (row + IMGAREA); r++) {
              for (let c = (col - IMGAREA) + 1; c < (col + IMGAREA); c++) {
                if (this.tilesIndexMatrix[r] && this.tilesIndexMatrix[r][c] && this.tilesIndexMatrix[r][c] === tilesDiff[j + 1].tileInd) {
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

          let bestTile: Image = this.tiles[tilesDiff[j].tileInd];
          this.tilesIndexMatrix[row][col] = tilesDiff[j].tileInd;
          resolve(bestTile);
        };
        _getBestTileForImage();
      }
    });
  }

  public generate(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const _generate = async () => {
        await this.getTiles().catch((err) => Promise.reject(err));
        if (this.tiles.length > 0) {
          await this.processRowsAndColumns(0, 0, this.rows, this.columns).catch((err) => Promise.reject(err));
          console.log('Saving mosaic image...');
          let outputImageName = await this.image.save().catch((err) => Promise.reject(err));
          if (this.enableConsoleLogging) console.log('Mosaic image saved! --> ' + outputImageName);
          resolve(outputImageName);
        }
        else {
          reject('Tiles were not loaded');
        }
      };
      _generate().catch((err) => { reject(err) });
    });
  }

}
