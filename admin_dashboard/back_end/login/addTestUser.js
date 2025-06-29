const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('./models/User') // Adjust the path if necessary

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10) // Password: 'password123'

    const newUser = new User({
      username: 'mystaff',
      password: hashedPassword,
      email: 'mystaff@gmail.com',
      userType: 'staff',
    })

    await newUser.save()
    console.log('Test user Maqbool inserted')
    mongoose.connection.close()
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
  })
