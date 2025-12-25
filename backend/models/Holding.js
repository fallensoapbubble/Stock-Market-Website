const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
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
    required: true,
    min: 0
  },
  avgPrice: {
    type: Number,
    required: true
  },
  totalInvested: {
    type: Number,
    required: true
  },
  exchange: {
    type: String,
    enum: ["NSE", "BSE"],
    default: "NSE"
  }
}, {
  timestamps: true
});

// Index for faster queries
holdingSchema.index({ userId: 1 });
holdingSchema.index({ symbol: 1, userId: 1 });

module.exports = mongoose.model("Holding", holdingSchema);