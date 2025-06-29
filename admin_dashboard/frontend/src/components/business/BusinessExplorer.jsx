import { motion } from 'framer-motion'
import { ChevronDown, Filter, MapPin, Search, Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'

// Mock data - replace with actual API calls
const fetchStores = async (searchTerm, filters) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    {
      id: 1,
      name: 'Karachi Cash and Carry',
      category: 'Books & Stationery',
      distance: 1.0,
      special: '20% off on all items',
      isFollowing: false,
    },
    {
      id: 2,
      name: 'Lahore Electronics Hub',
      category: 'Electronics',
      distance: 2.5,
      special: 'Buy one, get one 30% off on gadgets',
      isFollowing: true,
    },
    {
      id: 3,
      name: 'Islamabad Fitness Center',
      category: 'Fitness',
      distance: 0.8,
      special: 'Free personal training for the first month',
      isFollowing: false,
    },
    {
      id: 4,
      name: 'Rawalpindi Grocery Mart',
      category: 'Grocery',
      distance: 0.5,
      special: '15% off on organic products',
      isFollowing: false,
    },
    {
      id: 5,
      name: 'Faisalabad Fashion Store',
      category: 'Clothing & Accessories',
      distance: 1.8,
      special: 'Buy 2 get 1 free on selected items',
      isFollowing: true,
    },
  ]
}

const categories = [
  'All',
  'Books & Stationery',
  'Electronics',
  'Fitness',
  'Grocery',
  'Clothing & Accessories',
]

const BusinessExplorer = ({ userLocation = 'Karachi' }) => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadStores = async () => {
      try {
        const fetchedStores = await fetchStores(searchTerm, selectedCategory)
        setStores(fetchedStores)
      } catch (error) {
        console.error('Failed to fetch stores:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStores()
  }, [searchTerm, selectedCategory])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const toggleFollow = (storeId) => {
    setStores(
      stores.map((store) =>
        store.id === storeId
          ? { ...store, isFollowing: !store.isFollowing }
          : store
      )
    )
  }

  const filteredStores = stores.filter(
    (store) =>
      (selectedCategory === 'All' || store.category === selectedCategory) &&
      store.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-6'>
        Explore Stores
      </h2>
      <p className='text-gray-300 mb-6'>
        Discover stores and deals near {userLocation}
      </p>

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4'>
        <div className='relative w-full md:w-2/3'>
          <input
            type='text'
            placeholder='Search stores...'
            className='w-full bg-gray-700 text-white rounded-md border-gray-600 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
        >
          <Filter className='w-4 h-4 mr-2' />
          Filters
          <ChevronDown
            className={`w-4 h-4 ml-2 transform ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='mb-6'
        >
          <h3 className='text-lg font-semibold text-gray-100 mb-2'>
            Categories
          </h3>
          <div className='flex flex-wrap gap-2'>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredStores.map((store) => (
            <motion.div
              key={store.id}
              className='bg-gray-700 rounded-md p-4 shadow'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex justify-between items-start mb-2'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-100'>
                    {store.name}
                  </h3>
                  <p className='text-sm text-gray-400'>{store.category}</p>
                </div>
                <button
                  onClick={() => toggleFollow(store.id)}
                  className={`flex items-center ${
                    store.isFollowing ? 'text-yellow-400' : 'text-gray-400'
                  } hover:text-yellow-300`}
                >
                  <Star
                    className='w-5 h-5 mr-1'
                    fill={store.isFollowing ? 'currentColor' : 'none'}
                  />
                  {store.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              <p className='text-gray-300 mb-2'>{store.special}</p>
              <div className='flex items-center text-sm text-gray-400'>
                <MapPin className='w-4 h-4 mr-1' />
                <span>{store.distance} km away</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default BusinessExplorer
