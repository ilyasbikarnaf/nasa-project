const fs = require("fs");
const { parse } = require("csv-parse");
const path = require("node:path");

const planets = [];

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(parse({ columns: true, comment: "#" }))
      .on("data", (chunk) => {
        if (isHabitablePlanet(chunk)) {
          planets.push(chunk);
        }
      })
      .on("error", (err) => {
        console.log("error occured in planets.model");
        reject();
      })
      .on("end", () => {
        console.log(`${planets.length} habitable planets found`);
        resolve();
      });
  });
}

function getAllPlanets() {
  return planets;
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
