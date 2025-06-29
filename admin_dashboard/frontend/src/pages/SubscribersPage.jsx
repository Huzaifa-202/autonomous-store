import { motion } from 'framer-motion'
import { ShoppingBag, UserCheck, UserPlus, UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import StatCard from '../components/common/StatCard'
import StorePerformanceChart from '../components/users/StorePerformanceChart'
import UserList from '../pages/UserList'
import LiveFeed from './LiveFeed'

const SubscribersPage = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    averageBasketSize: 0,
    averageDailyCustomers: 0,
  })

  const handleUserCountChange = (count) => {
    setUserStats((prevStats) => ({
      ...prevStats,
      totalUsers: count,
    }))
  }

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch total customers
        const totalRes = await fetch(
          'http://localhost:8800/api/customers/count'
        )
        const totalData = await totalRes.json()
        // Fetch average daily customers
        const avgDailyRes = await fetch(
          'http://localhost:8800/api/customers/average-daily'
        )
        const avgDailyData = await avgDailyRes.json()
        // Fetch average basket size
        const avgBasketRes = await fetch(
          'http://localhost:8800/api/transactions/average-basket-size'
        )
        const avgBasketData = await avgBasketRes.json()
        // Fetch average checkout time
        const avgCheckoutRes = await fetch(
          'http://localhost:8800/api/customers/average-checkout-time'
        )
        const avgCheckoutData = await avgCheckoutRes.json()

        setUserStats((prevStats) => ({
          ...prevStats,
          averageDailyCustomers: avgDailyData.averageDailyCustomers || 300,
          activeUsers: avgCheckoutData.averageCheckoutTime || 0,
          averageBasketSize: avgBasketData.averageBasketSize || 0,
        }))
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }
    fetchUserStats()
  }, [])

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name='Total Customers'
            icon={UsersIcon}
            value={userStats.totalUsers.toLocaleString()}
            color='#6366F1'
          />
          <LiveFeed
            name='In Store Customers'
            icon={UsersIcon}
            color='#3B82F6'
          />

          <StatCard
            name='Average Daily Customers'
            icon={UserPlus}
            value={userStats.averageDailyCustomers.toLocaleString()}
            color='#10B981'
          />
          <StatCard
            name='Average Checkout Time'
            icon={UserCheck}
            value={`3.5 mins`}
            color='#F59E0B'
          />
          <StatCard
            name='Average Basket Size'
            icon={ShoppingBag}
            value={userStats.averageBasketSize.toFixed(2)}
            color='#EF4444'
          />
        </motion.div>

        {/* USER CHARTS */}
        <div className='gap-6 mt-8'>
          <StorePerformanceChart />
          <div className='gap-6 mt-8'>
            <UserList onUserCountChange={handleUserCountChange} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default SubscribersPage
