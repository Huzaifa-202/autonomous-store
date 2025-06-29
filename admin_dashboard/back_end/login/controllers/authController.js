const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const moment = require('moment')

// Register a new user
exports.register = async (req, res) => {
  console.log('Registration endpoint hit')
  const { username, password, email, userType } = req.body

  try {
    // Ensure email is stored in lowercase
    const normalizedEmail = email.toLowerCase()

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create and save the new user
    const newUser = new User({
      username,
      password: hashedPassword,
      email: normalizedEmail,
      userType,
    })

    await newUser.save()
    res.status(201).json({ message: 'User registered successfully!' })
  } catch (error) {
    console.error('Error during registration:', error.message)
    res.status(400).json({ error: error.message })
  }
}

// Login user
exports.login = async (req, res) => {
  console.log('Login endpoint hit')
  const { email, password } = req.body

  try {
    // Ensure email is case-insensitive
    const normalizedEmail = email.toLowerCase()

    // Find the user by email
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      console.log('No user found with email:', normalizedEmail)
      return res.status(404).json({ message: 'User not found' })
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.log('Password mismatch for email:', normalizedEmail)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Respond with token and user details
    res.json({
      token,
      userType: user.userType,
      email: user.email,
      name: user.username,
    })
  } catch (error) {
    console.error('Error during login:', error.message)
    res.status(400).json({ error: error.message })
  }
}

// Forgot password with OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const otp = Math.floor(1000 + Math.random() * 9000) // Generate 4-digit OTP
    const expiration = moment().add(2, 'minutes').unix() // OTP expires in 2 minutes

    const token = jwt.sign({ otp, expiration }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your Forgot Password code is ${otp}`,
    }

    await transporter.sendMail(mailOptions)
    res.status(200).json({ message: 'OTP sent successfully', token })
  } catch (error) {
    console.error('Error during OTP generation:', error.message)
    res.status(500).json({ error: 'Error sending OTP' })
  }
}

// Verify OTP
exports.verifyOtp = (req, res) => {
  const { token, enteredOtp } = req.body

  if (!token || !enteredOtp) {
    return res.status(400).send('Token and OTP are required')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { otp, expiration } = decoded

    if (moment().unix() > expiration) {
      return res.status(400).json({ message: 'OTP has expired' })
    }

    if (parseInt(enteredOtp) !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    res.status(200).json({ message: 'OTP verified successfully' })
  } catch (error) {
    console.error('Error during OTP verification:', error.message)
    res.status(500).json({ error: 'Error verifying OTP' })
  }
}
