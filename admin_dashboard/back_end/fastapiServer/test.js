// server.js

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

// MongoDB Configuration
const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority'

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err))

// Define a Transaction Schema
const transactionSchema = new mongoose.Schema({
  product_columns: [String],
  future_periods: Number,
})

// Define a Model based on the schema
const Transaction = mongoose.model('Transaction', transactionSchema)

// Initialize the Express app
const app = express()
app.use(cors())
app.use(bodyParser.json())

// POST route to save the input to the database
app.post('/save-prediction', async (req, res) => {
  const { product_columns, future_periods } = req.body

  try {
    const newTransaction = new Transaction({
      product_columns,
      future_periods,
    })

    // Save to the MongoDB collection
    await newTransaction.save()

    res
      .status(201)
      .json({ message: 'Data successfully saved', data: newTransaction })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error saving data', error })
  }
})

// Start the server
const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
