const { Schema } = require("mongoose");

const OrdersSchm = new Schema({
  name: String,
  qty: Number,
  price: Number,
  mode: String
});

module.exports = {OrdersSchm} ;
