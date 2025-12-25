const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    enum: ["NSE", "BSE"],
    default: "NSE"
  },
  ltp: {
    type: Number,
    required: true
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  previousClose: {
    type: Number,
    required: true
  },
  open: Number,
  high: Number,
  low: Number,
  volume: {
    type: Number,
    default: 0
  },
  marketCap: Number,
  sector: String,
  industry: String,
  isActive: {
    type: Boolean,
    default: true
  },
  ohlc: {
    open: Number,
    high: Number,
    low: Number,
    close: Number
  }
}, {
  timestamps: true
});

// Index for faster searches
stockSchema.index({ symbol: 1, exchange: 1 });
stockSchema.index({ name: "text", symbol: "text" });

module.exports = mongoose.model("Stock", stockSchema);