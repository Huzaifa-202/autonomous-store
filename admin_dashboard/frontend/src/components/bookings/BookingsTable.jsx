import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import SeasonTop from '../SeasonTop'
const CustomerBookingsTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredBookings, setFilteredBookings] = useState([])

  useEffect(() => {
    // Fetch booking data from the backend
    const fetchBookings = async () => {
      try {
        const response = await fetch('http://localhost:8800/api/bookings')
        const data = await response.json()
        setFilteredBookings(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchBookings()
  }, [])

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    setFilteredBookings((prev) =>
      prev.filter(
        (booking) =>
          booking.id.toLowerCase().includes(term) ||
          booking.customer.toLowerCase().includes(term)
      )
    )
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>Customer Data</h2>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search orders...'
            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Booking ID
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Customer
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Total Spent
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Products Bought
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                Date
              </th>
            </tr>
          </thead>

          <tbody className='divide divide-gray-700'>
            {filteredBookings.map((booking) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                  {booking.id}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                  {booking.customer}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                  ${booking.totalSpent.toFixed(2)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                  {booking.productsBought}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  {booking.bookingDate}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default CustomerBookingsTable
