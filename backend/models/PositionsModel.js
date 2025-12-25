const {model} = require("mongoose");
const mongoose = require("mongoose");


const {PositionsSchm} = require("../schemas/PositionsSchema");

const PositionsMdl = mongoose.model("postions",PositionsSchm);

module.exports = PositionsMdl;





