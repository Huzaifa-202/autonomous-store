import { motion } from 'framer-motion'
import { ChevronDown, Search, Clock, Users, ShoppingCart } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'

const CustomerBehaviorTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    // Simulate real-time customer count update
    const interval = setInterval(() => {
      setCustomerCount((prevCount) => Math.floor(Math.random() * 50) + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredCustomers = useMemo(() => {
    return customerData.filter((customer) => {
      const matchesSearch =
        customer.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.interactionLevel
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesLocation =
        selectedLocation === 'All' ||
        customer.storeLocation === selectedLocation
      return matchesSearch && matchesLocation
    })
  }, [searchTerm, selectedLocation])

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0'>
        <h2 className='text-xl font-semibold text-gray-100'>
          Customer Behavior Analysis
        </h2>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center text-gray-300'>
            <Users className='mr-2' size={18} />
            {/* <span>Current Customers: {customerCount}</span> */}
          </div>
          <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search areas...'
                className='w-full sm:w-64 bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className='absolute left-3 top-2.5 text-gray-400'
                size={18}
              />
            </div>
            <div className='relative'>
              <select
                className='w-full sm:w-48 appearance-none bg-gray-700 text-white rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {storeLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <ChevronDown
                className='absolute right-3 top-2.5 text-gray-400'
                size={18}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Area
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Time Spent
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Interaction Level
              </th>

              <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Purchase Made
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-700'>
            {filteredCustomers.map((customer) => (
              <motion.tr
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='px-4 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-100'>
                    {customer.area}
                  </div>
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <div className='flex items-center text-sm text-gray-300'>
                    <Clock className='mr-2' size={14} />
                    {customer.timeSpent} mins
                  </div>
                </td>
                <td className='px-4 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.interactionLevel === 'High'
                        ? 'bg-green-800 text-green-100'
                        : customer.interactionLevel === 'Medium'
                        ? 'bg-yellow-800 text-yellow-100'
                        : 'bg-red-800 text-red-100'
                    }`}
                  >
                    {customer.interactionLevel}
                  </span>
                </td>

                <td className='px-4 py-4 whitespace-nowrap'>
                  <div className='flex items-center text-sm text-gray-300'>
                    {customer.purchaseMade ? (
                      <ShoppingCart className='mr-2 text-green-500' size={14} />
                    ) : (
                      <ShoppingCart className='mr-2 text-red-500' size={14} />
                    )}
                    {customer.purchaseMade ? 'Yes' : 'No'}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

const customerData = [
  {
    id: 1,
    area: 'Electronics',
    timeSpent: 15,
    interactionLevel: 'High',

    purchaseMade: true,
    storeLocation: 'Manhattan',
  },
  {
    id: 2,
    area: 'Groceries',
    timeSpent: 7,
    interactionLevel: 'Medium',

    purchaseMade: true,
    storeLocation: 'Central London',
  },
  // Add more sample data as needed
]

const storeLocations = [
  'All',
  'Manhattan',
  'Central London',
  'Downtown Toronto',
  'Champs-Élysées',
  'CBD',
]

export default CustomerBehaviorTable
