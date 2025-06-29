import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink, Mail, X } from 'lucide-react'
import { useEffect, useState } from 'react'

// Mock data - replace with actual API calls
const fetchSubscribedBusinesses = async () => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    {
      id: 1,
      name: 'Local Cafe',
      category: 'Food & Drink',
      latestFlyer: { id: 101, title: 'Summer Specials', url: '#' },
    },
    {
      id: 2,
      name: 'TechGadgets',
      category: 'Electronics',
      latestFlyer: { id: 102, title: 'Back to School Sale', url: '#' },
    },
    {
      id: 3,
      name: 'FitLife Gym',
      category: 'Fitness',
      latestFlyer: { id: 103, title: 'New Year, New You', url: '#' },
    },
    {
      id: 4,
      name: 'GreenGrocer',
      category: 'Grocery',
      latestFlyer: { id: 104, title: 'Fresh Produce Week', url: '#' },
    },
    {
      id: 5,
      name: 'BookWorm',
      category: 'Retail',
      latestFlyer: { id: 105, title: 'Bestsellers Discount', url: '#' },
    },
  ]
}

const SubscribedBusinesses = () => {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedBusiness, setExpandedBusiness] = useState(null)

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const fetchedBusinesses = await fetchSubscribedBusinesses()
        setBusinesses(fetchedBusinesses)
      } catch (error) {
        console.error('Failed to fetch subscribed businesses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBusinesses()
  }, [])

  const handleUnsubscribe = async (businessId) => {
    // This is where you'd make an API call to unsubscribe
    // For now, we'll just remove it from the local state
    setBusinesses(businesses.filter((business) => business.id !== businessId))
    alert(`You've been unsubscribed from the business's email list.`)
  }

  const toggleExpand = (businessId) => {
    setExpandedBusiness(expandedBusiness === businessId ? null : businessId)
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-10'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-6'>
        Your Subscribed Businesses
      </h2>

      <div className='bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-md p-4 mb-6'>
        <p className='text-yellow-200 text-sm'>
          <Mail className='inline-block mr-2 mb-1' size={18} />
          When you subscribe to a business, you join their email list to receive
          their latest flyers and promotions.
        </p>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <div className='space-y-4'>
          {businesses.map((business) => (
            <motion.div
              key={business.id}
              className='bg-gray-700 rounded-md p-4 shadow'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-100'>
                    {business.name}
                  </h3>
                  <p className='text-sm text-gray-400'>{business.category}</p>
                </div>
                <button
                  onClick={() => toggleExpand(business.id)}
                  className='text-blue-400 hover:text-blue-300'
                >
                  {expandedBusiness === business.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>

              {expandedBusiness === business.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='mt-4 space-y-2'
                >
                  <div className='flex justify-between items-center'>
                    <p className='text-gray-300'>
                      Latest Flyer: {business.latestFlyer.title}
                    </p>
                    <a
                      href={business.latestFlyer.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-400 hover:text-blue-300 flex items-center'
                    >
                      View <ExternalLink size={16} className='ml-1' />
                    </a>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(business.id)}
                    className='flex items-center text-red-400 hover:text-red-300'
                  >
                    <X size={16} className='mr-1' /> Unsubscribe
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!loading && businesses.length === 0 && (
        <p className='text-gray-400 text-center'>
          You are not subscribed to any businesses yet.
        </p>
      )}
    </motion.div>
  )
}

export default SubscribedBusinesses
