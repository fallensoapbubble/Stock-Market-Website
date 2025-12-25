const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const HoldingsSchm = new Schema({
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
});

const HoldingMdl = mongoose.model("holdings",HoldingsSchm);

module.exports = HoldingMdl;