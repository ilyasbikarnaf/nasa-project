const mognoose = require("mongoose");

const planetSchema = new mognoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

module.exports = mognoose.model("Planet", planetSchema);
