const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(cors())

mongoose.connect(
  'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

const productSchema = new mongoose.Schema({
  name: String,
  currentStock: Number,
  threshold: Number,
})

const notificationSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  productName: String,
  message: String,
  timestamp: Date,
  status: String,
})

const Product = mongoose.model('Product', productSchema)
const Notification = mongoose.model('Notification', notificationSchema)

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add new products (allowing multiple entries)
app.post('/api/products', async (req, res) => {
  // Check if the request body is an array
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Request body must be an array' })
  }

  try {
    // Create multiple products
    const products = await Product.insertMany(req.body)
    res.status(201).json(products)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get all notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 })
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Send a notification
app.post('/api/sendNotification', async (req, res) => {
  const { productId, productName, message, timestamp, status } = req.body

  const newNotification = new Notification({
    productId,
    productName,
    message,
    timestamp,
    status,
  })

  try {
    const savedNotification = await newNotification.save()
    res.status(201).json(savedNotification)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update product stock
app.put('/api/products/:id/stock', async (req, res) => {
  const { id } = req.params
  const { currentStock } = req.body

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { currentStock },
      { new: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get products below threshold (for Restock Dashboard)
app.get('/api/products/below-threshold', async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lt: ['$currentStock', '$threshold'] },
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
