import { motion } from 'framer-motion'
import { Clock, MapPin, Store, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'

// Mock data - replace with actual API calls
const fetchUpdates = async () => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    {
      id: 1,
      type: 'update',
      business: 'Acme Corp',
      content: "We've just launched our summer collection!",
      timestamp: '2024-06-15T10:00:00Z',
    },
    {
      id: 2,
      type: 'deal',
      business: 'Local Cafe',
      content: '50% off on all desserts this weekend!',
      location: 'Downtown',
      validUntil: '2024-06-18T23:59:59Z',
    },
    {
      id: 3,
      type: 'update',
      business: 'TechGadgets',
      content: 'New smartphones in stock. Visit our store for exclusive deals!',
      timestamp: '2024-06-14T14:30:00Z',
    },
    {
      id: 4,
      type: 'deal',
      business: 'FitLife Gym',
      content: 'Join now and get 3 months free on annual membership',
      location: 'Westside',
      validUntil: '2024-06-30T23:59:59Z',
    },
    {
      id: 5,
      type: 'update',
      business: 'GreenGrocer',
      content:
        'Fresh organic produce just arrived. First 50 customers get a free reusable bag!',
      timestamp: '2024-06-16T08:00:00Z',
    },
  ]
}

const Updates = ({ userCity = 'New York' }) => {
  const [feedItems, setFeedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const updates = await fetchUpdates()
        setFeedItems(updates)
      } catch (error) {
        console.error('Failed to fetch feed items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [])

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-10'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-2xl font-semibold text-gray-100 mb-6'>My Feed</h2>
      <p className='text-gray-300 mb-6'>
        Showing updates and deals near {userCity}
      </p>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <div className='space-y-6'>
          {feedItems.map((item) => (
            <motion.div
              key={item.id}
              className='bg-gray-700 rounded-lg p-4 shadow'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex items-center mb-2'>
                {item.type === 'update' ? (
                  <Store className='w-5 h-5 mr-2 text-blue-400' />
                ) : (
                  <Tag className='w-5 h-5 mr-2 text-green-400' />
                )}
                <span className='text-lg font-semibold text-gray-100'>
                  {item.business}
                </span>
              </div>
              <p className='text-gray-300 mb-2'>{item.content}</p>
              <div className='flex items-center text-sm text-gray-400'>
                {item.type === 'update' ? (
                  <>
                    <Clock className='w-4 h-4 mr-1' />
                    <span>{formatDate(item.timestamp)}</span>
                  </>
                ) : (
                  <>
                    <MapPin className='w-4 h-4 mr-1' />
                    <span>{item.location}</span>
                    <span className='mx-2'>•</span>
                    <Clock className='w-4 h-4 mr-1' />
                    <span>Valid until {formatDate(item.validUntil)}</span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default Updates
