const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Connect to MongoDB Atlas
mongoose
  .connect(
    'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Define schemas
const ProductSchema = new mongoose.Schema({
  name: String,
  currentStock: Number,
  threshold: Number,
})

const NotificationSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now },
})

// Define models
const Product = mongoose.model('Product', ProductSchema)
const Notification = mongoose.model('Notification', NotificationSchema)

// Routes

// Post a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, currentStock, threshold } = req.body
    const newProduct = new Product({ name, currentStock, threshold })
    await newProduct.save()
    res.json({ message: 'Product added successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error adding product' })
  }
})

// Get low stock items
app.get('/api/lowStockItems', async (req, res) => {
  try {
    const lowStockItems = await Product.find()
    const filteredItems = lowStockItems.filter(
      (item) => item.currentStock < item.threshold
    )
    res.json(filteredItems)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock items' })
  }
})

// Get all notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 })
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' })
  }
})

// Get inventory data
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await Product.find()
    res.json(inventory)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory data' })
  }
})

// Send restock request
app.post('/api/restockRequest', async (req, res) => {
  try {
    const { itemId } = req.body
    const product = await Product.findById(itemId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const notification = new Notification({
      message: `Restock request sent for ${product.name}`,
    })
    await notification.save()

    res.json({ message: 'Restock request sent successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error sending restock request' })
  }
})

// Send notification (from admin to staff)
app.post('/api/sendNotification', async (req, res) => {
  try {
    const { message } = req.body
    const notification = new Notification({ message })
    await notification.save()
    res.json({ message: 'Notification sent successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification' })
  }
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
