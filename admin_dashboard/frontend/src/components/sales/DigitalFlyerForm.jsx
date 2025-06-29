import { motion } from 'framer-motion'
import { AlertCircle, Send, Upload } from 'lucide-react'
import { useState } from 'react'

// Mock function for sending flyers - replace with actual implementation
const sendFlyers = async (formData) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true, message: 'Flyers sent successfully!' }
}

// Mock function to get store locations - replace with actual data
const getStoreLocations = () => ['All Stores', 'Store A', 'Store B', 'Store C']

const DigitalFlyerForm = ({ userType = 'free', flyersSentThisMonth = 0 }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    file: null,
    storeLocation: 'All Stores',
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, file: e.target.files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setResult(null)

    try {
      // Here you would typically send the formData to your backend
      const response = await sendFlyers(formData)
      setResult({ type: 'success', message: response.message })
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to send flyers. Please try again.',
      })
    } finally {
      setSending(false)
    }
  }

  const flyerLimit = userType === 'free' ? 50 : 500
  const flyersRemaining = flyerLimit - flyersSentThisMonth
  const isLimitReached = flyersRemaining <= 0

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-2xl font-semibold text-gray-100 mb-6'>
        Send Digital Flyer
      </h2>

      <div className='bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-4 mb-6'>
        <div className='flex items-start'>
          <AlertCircle className='h-5 w-5 text-blue-400 mt-0.5 mr-2' />
          <div>
            <h3 className='text-sm font-medium text-blue-300'>
              Flyer Sending Limits
            </h3>
            <p className='mt-1 text-sm text-blue-200'>
              You have sent {flyersSentThisMonth} flyers this month. You can
              send up to {flyerLimit} flyers per month.
              {userType === 'free' &&
                ' Upgrade to send up to 500 flyers per month.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='subject'
            className='block text-sm font-medium text-gray-300 mb-1'
          >
            Subject Line
          </label>
          <input
            type='text'
            id='subject'
            name='subject'
            value={formData.subject}
            onChange={handleInputChange}
            className='w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>

        <div>
          <label
            htmlFor='message'
            className='block text-sm font-medium text-gray-300 mb-1'
          >
            Email Body
          </label>
          <textarea
            id='message'
            name='message'
            value={formData.message}
            onChange={handleInputChange}
            rows='4'
            className='w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          ></textarea>
        </div>

        <div>
          <label
            htmlFor='file'
            className='block text-sm font-medium text-gray-300 mb-1'
          >
            Upload Digital Flyer
          </label>
          <div className='flex items-center space-x-2'>
            <label className='cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center'>
              <Upload className='w-4 h-4 mr-2' />
              <span>Choose File</span>
              <input
                type='file'
                id='file'
                onChange={handleFileChange}
                className='hidden'
                accept='.pdf,.jpg,.jpeg,.png'
                required
              />
            </label>
            <span className='text-sm text-gray-400'>
              {formData.file ? formData.file.name : 'No file chosen'}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor='storeLocation'
            className='block text-sm font-medium text-gray-300 mb-1'
          >
            Select Store Location
          </label>
          <select
            id='storeLocation'
            name='storeLocation'
            value={formData.storeLocation}
            onChange={handleInputChange}
            className='w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            {getStoreLocations().map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <button
          type='submit'
          disabled={sending || isLimitReached}
          className={`w-full ${
            isLimitReached ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-bold py-2 px-4 rounded flex items-center justify-center`}
        >
          {sending ? (
            <span className='loader'></span>
          ) : (
            <>
              <Send className='w-4 h-4 mr-2' />
              Send Flyer
            </>
          )}
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-4 p-3 rounded ${
            result.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {result.message}
        </motion.div>
      )}

      <style jsx>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  )
}

export default DigitalFlyerForm
