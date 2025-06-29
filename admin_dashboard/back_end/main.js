const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors') // Add this

const app = express()
const PORT = 8800

// Middleware
app.use(bodyParser.json())
app.use(cors()) // Enable CORS for all routes

// MongoDB connection
mongoose.connect(
  'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB')
})

// Define a Schema for weekly engagement
const EngagementSchema = new mongoose.Schema({
  day: String,
  userEngagement: Number,
  newCustomers: Number,
})

const Engagement = mongoose.model('Engagement', EngagementSchema)

// API to add engagement data
app.post('/api/engagement', async (req, res) => {
  const { day, userEngagement, newCustomers } = req.body
  try {
    const newEntry = new Engagement({ day, userEngagement, newCustomers })
    await newEntry.save()
    res.status(201).json(newEntry)
  } catch (error) {
    res.status(500).json({ error: 'Error saving data' })
  }
})

// API to fetch engagement data
app.get('/api/engagement', async (req, res) => {
  try {
    const data = await Engagement.find()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' })
  }
})

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

// Enable CORS to allow requests from your frontend

// Route to get sorted transactions
// API to fetch total customers
app.get('/api/customers/count', async (req, res) => {
  try {
    const totalCustomers = await Transaction.countDocuments() // Assuming "Transaction" represents customers
    res.json({ totalCustomers })
  } catch (error) {
    console.error('Error fetching total customers:', error)
    res.status(500).json({ error: 'Error fetching total customers' })
  }
})

// API to calculate average basket size
app.get('/api/transactions/average-basket-size', async (req, res) => {
  try {
    const aggregationResult = await Transaction.aggregate([
      {
        $group: {
          _id: null, // Group all transactions
          totalItems: { $sum: '$Total_Items' }, // Sum up all items across transactions
          transactionCount: { $sum: 1 }, // Count the number of transactions
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id from results
          averageBasketSize: { $divide: ['$totalItems', '$transactionCount'] }, // Calculate average
        },
      },
    ])

    // If no transactions exist, return 0
    const averageBasketSize = aggregationResult.length
      ? aggregationResult[0].averageBasketSize
      : 0

    res.json({ averageBasketSize })
  } catch (error) {
    console.error('Error calculating average basket size:', error)
    res.status(500).json({
      error: 'Error calculating average basket size',
      details: error.message,
    })
  }
})

// API to fetch average daily customers
app.get('/api/customers/average-daily', async (req, res) => {
  try {
    const aggregationResult = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$Date' } }, // Group by date
          dailyCustomerCount: { $sum: 1 }, // Count transactions per day
        },
      },
      {
        $group: {
          _id: null, // Group everything to calculate the average
          averageDailyCustomers: { $avg: '$dailyCustomerCount' },
        },
      },
    ])

    const averageDailyCustomers = aggregationResult.length
      ? aggregationResult[0].averageDailyCustomers
      : 0

    res.json({ averageDailyCustomers: Math.round(averageDailyCustomers) })
  } catch (error) {
    console.error('Error fetching average daily customers:', error)
    res.status(500).json({ error: 'Error calculating average daily customers' })
  }
})

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

const bookingSchema = new mongoose.Schema({
  id: String,
  customer: String,
  totalSpent: Number,
  status: String,
  bookingDate: String,
  productsBought: Number,
})

// Define booking model
const Booking = mongoose.model('Booking', bookingSchema)

// Create a route to fetch all bookings
app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find()
  res.json(bookings)
})

// Create a route to add a booking
app.post('/api/bookings', async (req, res) => {
  const newBooking = new Booking(req.body)
  await newBooking.save()
  res.status(201).json(newBooking)
})

const CustomerSchema = new mongoose.Schema({
  timestamp: Date,
  total_persons: Number,
  frame_number: Number,
})

const Customer = mongoose.model('person_counts', CustomerSchema)

// Route to fetch the latest object
app.get('/api/customers/latest', async (req, res) => {
  try {
    const latestCustomer = await Customer.findOne()
      .sort({ timestamp: -1 }) // Get the latest document
      .exec()

    res.json(latestCustomer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

const timeSpentSchema = new mongoose.Schema({
  ID: String,
  entry_time: Number,
  exit_time: Number,
  total_time_spent: Number,
  timestamp: Date,
})

const TimeSpent = mongoose.model('TimeSpent', timeSpentSchema)

app.get('/api/customers/average-checkout-time', async (req, res) => {
  try {
    const data = await TimeSpent.aggregate([
      {
        $group: {
          _id: null,
          totalTimeSpent: { $sum: '$total_time_spent' },
          count: { $sum: 1 },
        },
      },
    ])

    if (data.length === 0) {
      return res.status(404).json({ averageCheckoutTime: 0 })
    }

    const averageCheckoutTime = data[0].totalTimeSpent / data[0].count
    res.json({ averageCheckoutTime })
  } catch (error) {
    console.error('Error calculating average checkout time:', error)
    res.status(500).json({ error: 'Failed to calculate average checkout time' })
  }
})

const alertSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    frame_number: { type: Number, required: true },
    unknown_id: { type: String, required: true },
    detection_type: { type: String, required: true },
    location: { type: Object, required: true },
    status: {
      type: String,
      enum: ['pending', 'handled'],
      default: 'pending',
    },
  },
  {
    collection: 'unknown_detection', // Explicitly specify the collection name
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
)

const Alert = mongoose.model('Alert', alertSchema)

// Routes
// Get all alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(50) // Limit to last 50 alerts for better performance
    res.status(200).json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error.message)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update alert status
app.patch('/api/alerts/:id', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status || !['pending', 'handled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' })
  }

  try {
    const alert = await Alert.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    res.status(200).json(alert)
  } catch (error) {
    console.error('Error updating alert:', error.message)
    res.status(400).json({ message: 'Error updating alert status' })
  }
})

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
