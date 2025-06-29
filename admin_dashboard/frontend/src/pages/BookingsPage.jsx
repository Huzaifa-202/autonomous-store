import { motion } from 'framer-motion'
import { CheckCircle, Clock, DollarSign, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

import BookingsTable from '../components/bookings/BookingsTable'

import OrderDistribution from '../components/bookings/OrderDistribution'
import Header from '../components/common/Header'
import StatCard from '../components/common/StatCard'
import SalesChannelChart from '../components/overview/SalesChannelChart'
import ProductFrequency from '../components/ProductFrequency'
import SeasonTop from '../components/SeasonTop'
// Assume this data is fetched from your backend or API
const initialBookingStats = {
  totalBookings: '0',
  pendingBookings: '0',
  completedBookings: '0',
  totalRevenue: '$0',
}

const BookingsPage = () => {
  const [bookingStats, setBookingStats] = useState(initialBookingStats)

  useEffect(() => {
    // Simulating a fetch call to get booking stats
    const fetchBookingStats = async () => {
      // Assume you fetch from an API, here we use setTimeout to mock it
      setTimeout(() => {
        setBookingStats({
          totalBookings: '570',
          pendingBookings: '56',
          completedBookings: '877',
          totalRevenue: '$98,765',
        })
      }, 3000)
    }

    fetchBookingStats()
  }, [])

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name='Total Products'
            icon={ShoppingBag}
            value={bookingStats.totalBookings}
            color='#6366F1'
          />
          {/* <StatCard
            name='Pending Orders'
            icon={Clock}
            value={bookingStats.pendingBookings}
            color='#F59E0B'
          /> */}
          {/* <StatCard
            name='Top'
            icon={CheckCircle}
            value={bookingStats.completedBookings}
            color='#10B981'
          /> */}
          {/* <StatCard
            name='Total Revenue'
            icon={DollarSign}
            value={bookingStats.totalRevenue}
            color='#EF4444'
          /> */}
        </motion.div>
        <div className=' gap-8 mb-8'>
          {/* <DailyBookings /> */}
          {/* <OrderDistribution /> */}
        </div>
        {/* <BookingsTable /> */}
        <div className=' gap-8 mb-8'>
          <SeasonTop />
          <ProductFrequency />
          <SalesChannelChart />
        </div>
      </main>
    </div>
  )
}

export default BookingsPage
