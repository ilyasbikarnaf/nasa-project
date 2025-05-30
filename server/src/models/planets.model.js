// const planets = require('./planets.mongo')

const fs = require("fs");
const { parse } = require("csv-parse");
const path = require("node:path");

const planets = require("./planets.mongo");

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
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log("error occured in planets.model");
        reject();
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;

        console.log(`${countPlanetsFound} habitable planets found`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({}, { __v: 0, _id: 0 });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      { upsert: true }
    );
  } catch (err) {
    console.error(`Coud not save a planet ${error}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
