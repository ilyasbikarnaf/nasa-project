const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
const DEFAULT_FLIGHT_NUMBER = 100;

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  for (const launchDoc of response.data.docs) {
    const launch = verifyLaunchDoc(launchDoc);

    await saveLaunch(launch);
  }

  console.log("done");
}

function verifyLaunchDoc(launch) {
  const payloads = launch["payloads"];
  const customers = payloads.flatMap((payload) => {
    return payload.customers;
  });

  const launchDate = launch["date_local"];
  let upcoming = launch["upcoming"];
  let success = launch["success"];

  if (new Date(launchDate) <= Date.now() && upcoming === true) {
    upcoming = false;
    success = false;
  }

  return {
    flightNumber: launch["flight_number"],
    mission: launch["name"],
    rocket: launch["rocket"]["name"],
    launchDate,
    upcoming,
    success,
    customers,
  };
}

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-1652 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("launch data already loaded");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getLastFlightNumber() {
  const latestFlight = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestFlight) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestFlight.flightNumber;
}

async function getAllLaunches(limit, skip) {
  return await launchesDatabase
    .find({}, { __v: 0, _id: 0 })
    .sort("flightNumber")
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  return await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function scheduleNewLaunch(launch) {
  try {
    const planet = await planets.findOne({ keplerName: launch.target });

    if (!planet) {
      throw new Error("No matching planet was found");
    }

    const newFlightNumber = (await getLastFlightNumber()) + 1;

    Object.assign(launch, {
      flightNumber: newFlightNumber,
      success: true,
      upcoming: true,
      customers: ["Zero To Mastery", "NASA"],
    });

    await saveLaunch(launch);
  } catch (err) {
    console.error(`error occured ${err}`);
  }
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );

  console.log(aborted);

  return aborted["modifiedCount"] === 1;
}

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
