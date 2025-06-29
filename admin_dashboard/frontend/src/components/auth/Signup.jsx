import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, EyeOff, Eye, Mail } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState('staff')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/auth/register', {
        username,
        password,
        email,
        userType,
      })
      alert('User registered successfully!')
      navigate('/login')
    } catch (error) {
      setError(
        error.response.data.error || 'An error occurred during registration'
      )
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
          Sign Up
        </h2>

        <form onSubmit={handleSignup}>
          <div className='mb-4'>
            <label className='block text-purple-300 text-sm font-bold mb-2'>
              Account Type:
            </label>
            <div className='flex justify-between'>
              <button
                type='button'
                className={`w-1/2 py-2 px-4 rounded-l ${
                  userType === 'staff'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setUserType('staff')}
              >
                Staff
              </button>
              <button
                type='button'
                className={`w-1/2 py-2 px-4 rounded-r ${
                  userType === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setUserType('admin')}
              >
                Admin
              </button>
            </div>
          </div>
          <div className='mb-4'>
            <label
              className='block text-purple-300 text-sm font-bold mb-2'
              htmlFor='username'
            >
              Username
            </label>
            <div className='relative'>
              <input
                className='appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                id='username'
                type='text'
                placeholder='Enter your username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
            </div>
          </div>
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
          {error && <p className='text-red-500 text-xs italic mb-4'>{error}</p>}
          <motion.button
            className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='submit'
          >
            Sign Up
          </motion.button>
        </form>

        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-400'>
            Already have an account?
            <motion.button
              className='ml-1 text-purple-400 hover:text-purple-300 font-semibold'
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Log in
            </motion.button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
