const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: true
  },
  avgPrice: {
    type: Number,
    required: true
  },
  productType: {
    type: String,
    enum: ["CNC", "MIS"],
    default: "MIS"
  },
  exchange: {
    type: String,
    enum: ["NSE", "BSE"],
    default: "NSE"
  },
  tradeDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
positionSchema.index({ userId: 1, tradeDate: 1 });
positionSchema.index({ symbol: 1, userId: 1 });

module.exports = mongoose.model("Position", positionSchema);