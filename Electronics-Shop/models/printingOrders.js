const mongoose = require("mongoose");

const PrintingOrders = mongoose.model("PrintingOrders", {
  orderID: Number,
  name: String,
  phone: String,
  grams: Number,
  color: String,
  quality: String,
  quantaty: String,
  buildTime: String,
  finishSurface: Boolean,
  technology: String,
  material: String,
  status: {type: String, default: "Pending"},
  date: Date,
  total: {type: String, default: "uncalculated"},
});

module.exports = PrintingOrders;