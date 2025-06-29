import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Save } from 'lucide-react'
import { useState } from 'react'

// Mock function to update user settings - replace with actual API call
const updateUserSettings = async (settings) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Settings updated:', settings)
  return { success: true, message: 'Settings updated successfully!' }
}

const UserSettings = () => {
  const [settings, setSettings] = useState({
    email: 'user@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newsletterEnabled: true,
    emailFrequency: 'weekly',
    restaurantEmails: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Basic form validation
    if (settings.newPassword !== settings.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      setLoading(false)
      return
    }

    try {
      const result = await updateUserSettings(settings)
      setMessage({ type: 'success', text: result.message })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update settings. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* <h2 className='text-xl font-semibold text-gray-100 mb-6'>
        Account Settings
      </h2> */}

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {/* <p className='text-white text-center'>{message.text}</p> */}
        </motion.div>
      )}
    </motion.div>
  )
}

export default UserSettings
