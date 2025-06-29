const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// Middleware
app.use(bodyParser.json())

// MongoDB connection
mongoose
  .connect(
    'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('Error connecting to MongoDB:', err))

// Define a schema for your data
const PredictionSchema = new mongoose.Schema({
  y: Number,
  ds: String,
})

// Create a model from the schema
const Prediction = mongoose.model('Prediction', PredictionSchema)

// POST endpoint to insert data
app.post('/add-prediction', async (req, res) => {
  try {
    const data = req.body // Expecting array of prediction data
    const result = await Prediction.insertMany(data)
    res.status(201).json({ message: 'Data inserted successfully', result })
  } catch (error) {
    console.error('Error inserting data:', error)
    res.status(500).json({ message: 'Failed to insert data', error })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
