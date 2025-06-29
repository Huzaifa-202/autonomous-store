import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, EyeOff, Eye } from 'lucide-react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const PasswordReset = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const token = new URLSearchParams(location.search).get('token')

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'An error occurred while resetting the password'
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
          Reset Password
        </h2>

        {success ? (
          <div className='text-green-400 text-center'>
            Password reset successful! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className='mb-4'>
              <label
                className='block text-purple-300 text-sm font-bold mb-2'
                htmlFor='newPassword'
              >
                New Password
              </label>
              <div className='relative'>
                <input
                  className='appearance-none border rounded w-full py-2 px-3 pl-10 pr-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter new password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            <div className='mb-6'>
              <label
                className='block text-purple-300 text-sm font-bold mb-2'
                htmlFor='confirmPassword'
              >
                Confirm New Password
              </label>
              <div className='relative'>
                <input
                  className='appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='confirmPassword'
                  type='password'
                  placeholder='Confirm new password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Lock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
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
              Reset Password
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default PasswordReset
