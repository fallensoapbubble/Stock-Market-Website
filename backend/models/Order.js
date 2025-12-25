const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
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
  orderType: {
    type: String,
    enum: ["LIMIT", "MARKET", "SL", "SL-M"],
    required: true
  },
  transactionType: {
    type: String,
    enum: ["BUY", "SELL"],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  triggerPrice: {
    type: Number,
    default: 0
  },
  productType: {
    type: String,
    enum: ["CNC", "MIS"],
    default: "CNC"
  },
  validity: {
    type: String,
    enum: ["DAY", "IOC"],
    default: "DAY"
  },
  status: {
    type: String,
    enum: ["PENDING", "EXECUTED", "CANCELLED", "REJECTED", "PARTIALLY_EXECUTED"],
    default: "PENDING"
  },
  executedQuantity: {
    type: Number,
    default: 0
  },
  executedPrice: {
    type: Number,
    default: 0
  },
  orderValue: {
    type: Number,
    required: true
  },
  executedAt: Date,
  cancelledAt: Date,
  modifiedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ symbol: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);