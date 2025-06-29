const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// MongoDB connection
mongoose
  .connect(
    'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Create schema and model
const transactionSchema = new mongoose.Schema({
  Transaction_ID: String,
  Date: {
    type: Date,
    required: true,
  },
  Customer_Name: String,
  Product: [String], // Assuming Product is an array of strings
  Total_Items: {
    type: Number, // Use Number for Int32
    required: true,
  },
  Total_Cost: {
    type: Number, // Use Number for double
    required: true,
  },
  Payment_Method: String,
  City: String,
  Store_Type: String,
  Discount_Applied: Boolean, // Boolean type is correct
  Customer_Category: String,
  Season: String,
  Promotion: String,
})

const Transaction = mongoose.model('Transaction', transactionSchema)

const app = express()
app.use(cors()) // Enable CORS to allow requests from your frontend

// Route to get sorted transactions
app.get('/api/transactions', async (req, res) => {
  try {
    // Fetch data sorted by date in ascending order
    const transactions = await Transaction.find().limit(10000)
    res.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error) // Improved error logging
    res
      .status(500)
      .json({ message: 'Error fetching data', error: error.message })
  }
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
