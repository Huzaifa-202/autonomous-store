import { motion } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  DollarSign,
  Filter,
  MapPin,
  Search,
  Star,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

// Mock data - replace with actual API calls
const fetchRentals = async (location, filters) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    {
      id: 1,
      name: 'Cozy Downtown Loft',
      location: 'New York, USA',
      price: 120,
      rating: 4.5,
      guests: 2,
      imageUrl:
        'https://cf.bstatic.com/xdata/images/hotel/max1024x768/233023054.jpg?k=36050c5f66416f73ab352552325f804673624fc59d2c2bbb5df7b342eec8395e&o=&hp=1',
    },
    {
      id: 2,
      name: 'Beachfront Villa',
      location: 'Bali, Indonesia',
      price: 200,
      rating: 4.8,
      guests: 6,
      imageUrl:
        'https://manage.isleblue.co/uploads/villas/images/99/st-martin-les-palmiers-2024-header2_medium.jpg',
    },
    {
      id: 3,
      name: 'Mountain Cabin',
      location: 'Aspen, USA',
      price: 150,
      rating: 4.2,
      guests: 4,
      imageUrl:
        'https://i.lmpm.com/img/lmpm-company-store-prod/64760d663a928/properties/02f9810b-827d-4b72-9abc-e4e269727dac/mountainsideretreat(74).jpg?w=2048&h=1152&q=60',
    },
    {
      id: 4,
      name: 'City Center Apartment',
      location: 'Paris, France',
      price: 180,
      rating: 4.6,
      guests: 3,
      imageUrl:
        'https://i.lmpm.com/img/lmpm-company-store-prod/64760d663a928/properties/02f9810b-827d-4b72-9abc-e4e269727dac/mountainsideretreat(74).jpg?w=2048&h=1152&q=60',
    },
    {
      id: 5,
      name: 'Lakeside Cottage',
      location: 'Lake District, UK',
      price: 100,
      rating: 4.4,
      guests: 5,
      imageUrl:
        'https://cdn.decoist.com/wp-content/uploads/2015/10/Scenic-landscape-surrounds-the-beautiful-lakeside-getaway.jpg',
    },
  ]
}

const Rentals = () => {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    guests: 1,
    dates: { start: null, end: null },
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadRentals = async () => {
      try {
        const fetchedRentals = await fetchRentals(location, filters)
        setRentals(fetchedRentals)
      } catch (error) {
        console.error('Failed to fetch rentals:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRentals()
  }, [location, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    // This would typically trigger a new search with the current location and filters
  }

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }))
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-10'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-6'>
        Short Term Rentals
      </h2>

      <form onSubmit={handleSearch} className='mb-6'>
        <div className='flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4'>
          <div className='relative flex-grow'>
            <input
              type='text'
              placeholder='Where are you going?'
              className='w-full bg-gray-700 text-white rounded-md border-gray-600 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <MapPin
              className='absolute left-3 top-2.5 text-gray-400'
              size={18}
            />
          </div>
          <button
            type='submit'
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center'
          >
            <Search className='w-4 h-4 mr-2' />
            Search
          </button>
          <button
            type='button'
            onClick={() => setShowFilters(!showFilters)}
            className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center'
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
      </form>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className='mb-6 p-4 bg-gray-700 rounded-md'
        >
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Price Range
              </label>
              <div className='flex items-center'>
                <DollarSign className='w-4 h-4 text-gray-400 mr-2' />
                <input
                  type='number'
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      parseInt(e.target.value),
                      filters.priceRange[1],
                    ])
                  }
                  className='w-full bg-gray-600 text-white rounded-md border-gray-500 px-2 py-1'
                  placeholder='Min'
                />
                <span className='mx-2 text-gray-400'>-</span>
                <input
                  type='number'
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      filters.priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className='w-full bg-gray-600 text-white rounded-md border-gray-500 px-2 py-1'
                  placeholder='Max'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Guests
              </label>
              <div className='flex items-center'>
                <Users className='w-4 h-4 text-gray-400 mr-2' />
                <input
                  type='number'
                  value={filters.guests}
                  onChange={(e) =>
                    handleFilterChange('guests', parseInt(e.target.value))
                  }
                  className='w-full bg-gray-600 text-white rounded-md border-gray-500 px-2 py-1'
                  min='1'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Dates
              </label>
              <div className='flex items-center'>
                <Calendar className='w-4 h-4 text-gray-400 mr-2' />
                <input
                  type='date'
                  value={filters.dates.start}
                  onChange={(e) =>
                    handleFilterChange('dates', {
                      ...filters.dates,
                      start: e.target.value,
                    })
                  }
                  className='w-full bg-gray-600 text-white rounded-md border-gray-500 px-2 py-1'
                />
                <span className='mx-2 text-gray-400'>-</span>
                <input
                  type='date'
                  value={filters.dates.end}
                  onChange={(e) =>
                    handleFilterChange('dates', {
                      ...filters.dates,
                      end: e.target.value,
                    })
                  }
                  className='w-full bg-gray-600 text-white rounded-md border-gray-500 px-2 py-1'
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {rentals.map((rental) => (
            <motion.div
              key={rental.id}
              className='bg-gray-700 rounded-md overflow-hidden shadow-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={rental.imageUrl}
                alt={rental.name}
                className='w-full h-48 object-cover'
              />
              <div className='p-4'>
                <h3 className='text-lg font-semibold text-gray-100 mb-1'>
                  {rental.name}
                </h3>
                <p className='text-sm text-gray-400 mb-2'>{rental.location}</p>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-gray-300'>${rental.price} / night</span>
                  <span className='flex items-center text-yellow-400'>
                    <Star className='w-4 h-4 mr-1 fill-current' />
                    {rental.rating}
                  </span>
                </div>
                <p className='text-sm text-gray-400'>
                  <Users className='inline w-4 h-4 mr-1 mb-1' /> Up to{' '}
                  {rental.guests} guests
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && rentals.length === 0 && (
        <p className='text-gray-400 text-center'>
          No rentals found. Try adjusting your search or filters.
        </p>
      )}
    </motion.div>
  )
}

export default Rentals
