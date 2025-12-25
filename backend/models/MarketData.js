const mongoose = require("mongoose");

const marketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
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
  volume: {
    type: Number,
    default: 0
  },
  ohlc: {
    open: Number,
    high: Number,
    low: Number,
    close: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
marketDataSchema.index({ symbol: 1, timestamp: -1 });
marketDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model("MarketData", marketDataSchema);