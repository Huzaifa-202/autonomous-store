const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Transaction = require('./models/Transaction')
require('dotenv').config()
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 5000

// Enable CORS for all requests
app.use(cors())
app.use(bodyParser.json())

// Connect to MongoDB
mongoose
  .connect(
    'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error: ', err))

// Route to fetch total sales, total users, and total products
app.get('/api/overview', async (req, res) => {
  try {
    const transactions = await Transaction.find().limit(5000)

    // Total Sales
    const totalSales = transactions.reduce(
      (acc, transaction) => acc + transaction.Total_Cost,
      0
    )

    // Total Users (Unique Users)
    const uniqueUsers = new Set(
      transactions.map((transaction) => transaction.Customer_Name)
    )
    const totalUsers = uniqueUsers.size

    // Total Products (Sum of total items)
    const totalProducts = transactions.reduce(
      (acc, transaction) => acc + transaction.Total_Items,
      0
    )

    return res.status(200).json({
      totalSales,
      totalUsers,
      totalProducts,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
})

app.listen(8080, () => {
  console.log(`Server running on port 8080`)
})
