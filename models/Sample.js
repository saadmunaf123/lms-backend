const mongoose = require("mongoose");

const SampleSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

module.exports = mongoose.model("Sample", SampleSchema);
