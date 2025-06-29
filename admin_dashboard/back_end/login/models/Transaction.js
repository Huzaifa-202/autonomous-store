const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  Transaction_ID: String,
  Date: Date,
  Customer_Name: String,
  Product: [String],
  Total_Items: Number,
  Total_Cost: Number,
  Payment_Method: String,
  City: String,
  Store_Type: String,
  Discount_Applied: Boolean,
  Customer_Category: String,
  Season: String,
  Promotion: String,
})

module.exports = mongoose.model('Transaction', transactionSchema)
