import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, EyeOff, Eye, Mail } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      })
      localStorage.setItem('token', response.data.token)
      navigate(
        response.data.userType === 'staff' ? '/restock-dashboard' : '/dashboard'
      )
    } catch (error) {
      setError(error.response.data.message || 'An error occurred during login')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      setOtpToken(response.data.token)
      setError('')
      alert('OTP sent to your email')
    } catch (error) {
      setError(error.response.data.message || 'An error occurred')
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        token: otpToken,
        enteredOtp: otp,
      })
      setError('')
      alert(
        'OTP verified successfully. You will be redirected to reset your password.'
      )
      // Redirect to the password reset page with the token
      navigate(`/reset-password?token=${response.data.resetToken}`)
    } catch (error) {
      setError(error.response.data.message || 'An error occurred')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-10'>
      <motion.div
        className='bg-gray-800 rounded-lg overflow-hidden max-w-md w-full p-8'
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className='text-3xl font-bold text-purple-300 mb-6 text-center'>
          Login
        </h2>

        {!showForgotPassword ? (
          <form onSubmit={handleLogin}>
            <div className='mb-4'>
              <label
                className='block text-purple-300 text-sm font-bold mb-2'
                htmlFor='username'
              >
                Username or Email
              </label>
              <div className='relative'>
                <input
                  className='appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='username'
                  type='text'
                  placeholder='Enter your username or email'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <User className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
              </div>
            </div>
            <div className='mb-6'>
              <label
                className='block text-purple-300 text-sm font-bold mb-2'
                htmlFor='password'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  className='appearance-none border rounded w-full py-2 px-3 pl-10 pr-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                <button
                  type='button'
                  className='absolute right-3 top-2.5 text-gray-400'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className='text-red-500 text-xs italic mb-4'>{error}</p>
            )}
            <motion.button
              className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type='submit'
            >
              Log In
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className='mb-4'>
              <label
                className='block text-purple-300 text-sm font-bold mb-2'
                htmlFor='email'
              >
                Email
              </label>
              <div className='relative'>
                <input
                  className='appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
              </div>
            </div>
            {otpToken && (
              <div className='mb-4'>
                <label
                  className='block text-purple-300 text-sm font-bold mb-2'
                  htmlFor='otp'
                >
                  OTP
                </label>
                <input
                  className='appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='otp'
                  type='text'
                  placeholder='Enter OTP'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
            {error && (
              <p className='text-red-500 text-xs italic mb-4'>{error}</p>
            )}
            <motion.button
              className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type='submit'
            >
              {otpToken ? 'Verify OTP' : 'Reset Password'}
            </motion.button>
          </form>
        )}

        <div className='mt-4 text-center'>
          <motion.button
            className='text-sm text-purple-400 hover:text-purple-300'
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showForgotPassword ? 'Back to Login' : 'Forgot Password?'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
