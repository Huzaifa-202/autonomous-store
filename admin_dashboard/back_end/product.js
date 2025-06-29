// createProducts.js
const mongoose = require('mongoose')
const Product = require('./models/Product')

// MongoDB connection
mongoose
  .connect(
    'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err))

// Create some products
const products = [
  {
    name: 'Product A',
    description: 'Description for Product A',
    price: 19.99,
    category: 'Category 1',
    stock: 10,
    threshold: 5,
  },
  {
    name: 'Product B',
    description: 'Description for Product B',
    price: 29.99,
    category: 'Category 2',
    stock: 5,
    threshold: 3,
  },
]

// Insert products into the database
Product.insertMany(products)
  .then(() => {
    console.log('Products saved to database')
    mongoose.connection.close() // Close the connection after insertion
  })
  .catch((error) => console.log('Error saving products:', error))
