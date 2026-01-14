// generateTiles.js
// Download map tiles for offline use (OpenStreetMap tiles)

const fs = require("fs");
const path = require("path");
const axios = require("axios");

// ---------------------------------------------
// CONFIG — SET YOUR AREA & ZOOM LEVELS
// ---------------------------------------------

// Example Bhopal area bounding box
const minLat = 23.15;
const maxLat = 23.35;
const minLng = 77.25;
const maxLng = 77.55;

// Zoom levels (10 = wide, 15 = very detailed)
const zoomLevels = [10, 11, 12, 13, 14, 15];

// Tile source (OSM)
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Output folder
const OUTPUT_DIR = path.join(__dirname, "../public/offline_tiles");

// ---------------------------------------------
// LAT/LNG to TILE CONVERSION
// ---------------------------------------------
function long2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

// ---------------------------------------------
// DOWNLOAD TILE FUNCTION
// ---------------------------------------------
async function downloadTile(url, outputPath) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
      timeout: 10000,
    });

    fs.writeFileSync(outputPath, response.data);
    console.log("✔ Downloaded:", outputPath);
  } catch (err) {
    console.log("✖ Failed:", outputPath);
  }
}

// ---------------------------------------------
// MAIN FUNCTION
// ---------------------------------------------
async function generateOfflineTiles() {
  console.log("🚀 Generating offline map tiles...");

  for (let z of zoomLevels) {
    const xStart = long2tile(minLng, z);
    const xEnd = long2tile(maxLng, z);
    const yStart = lat2tile(maxLat, z);
    const yEnd = lat2tile(minLat, z);

    console.log(`Zoom ${z}: X ${xStart}-${xEnd}, Y ${yStart}-${yEnd}`);

    for (let x = xStart; x <= xEnd; x++) {
      for (let y = yStart; y <= yEnd; y++) {
        const tileUrl = TILE_URL.replace("{z}", z)
          .replace("{x}", x)
          .replace("{y}", y);

        const outputPath = path.join(OUTPUT_DIR, `${z}/${x}`);
        const tilePath = path.join(outputPath, `${y}.png`);

        fs.mkdirSync(outputPath, { recursive: true });

        await downloadTile(tileUrl, tilePath);
      }
    }
  }

  console.log("🎉 Offline tiles download completed!");
}

generateOfflineTiles();
