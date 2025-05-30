const mongoose = require("mongoose");

mongoose.connection.once("open", () => {
  console.log("Mongodb connection ready!");
});

mongoose.connection.once("error", (err) => {
  console.error(err);
});

mongoose.connection.on("disconnect", () => {
  console.log("connection disconnected");
});

const MONGO_URL = process.env.MONGO_URL;

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongooseDiconnect() {
  await mongoose.disconnect();
}

module.exports = { mongoConnect, mongooseDiconnect };
