import { AnimatePresence, motion } from 'framer-motion'
import { Inbox, Loader2, TrendingUp, UserPlus, Users } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchRecentUsers, fetchUsers } from '../../services/fetchUsers'

const shimmer = {
  hidden: {
    opacity: 0.5,
  },
  visible: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1,
      ease: 'easeInOut',
    },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

const StatCardSkeleton = () => (
  <motion.div
    variants={itemVariants}
    className='rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6'
  >
    <div className='flex items-center justify-between'>
      <div className='space-y-2'>
        <motion.div
          className='h-4 w-24 bg-gray-700/50 rounded'
          variants={shimmer}
          initial='hidden'
          animate='visible'
        />
        <motion.div
          className='h-8 w-16 bg-gray-700/50 rounded'
          variants={shimmer}
          initial='hidden'
          animate='visible'
        />
      </div>
      <motion.div
        className='rounded-full bg-gray-700/50 p-3 h-12 w-12'
        variants={shimmer}
        initial='hidden'
        animate='visible'
      />
    </div>
    <motion.div
      className='mt-2 h-4 w-20 bg-gray-700/50 rounded'
      variants={shimmer}
      initial='hidden'
      animate='visible'
    />
  </motion.div>
)

const ChartSkeleton = () => (
  <motion.div
    variants={itemVariants}
    className='h-[400px] w-full rounded-xl bg-gray-800/50 p-4'
  >
    <div className='h-full w-full flex items-center justify-center'>
      <div className='space-y-4 w-full'>
        <motion.div
          className='h-[300px] w-full bg-gray-700/50 rounded'
          variants={shimmer}
          initial='hidden'
          animate='visible'
        />
        <div className='flex justify-between px-4'>
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className='h-4 w-12 bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
              custom={i}
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
)

const LoadingState = () => (
  <motion.div
    variants={containerVariants}
    initial='hidden'
    animate='visible'
    className='mx-auto max-w-7xl p-4 md:p-6 lg:p-8'
  >
    <motion.div
      variants={itemVariants}
      className='overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-lg'
    >
      <div className='mb-8 flex items-center justify-between'>
        <div className='space-y-1'>
          <motion.div
            className='h-8 w-48 bg-gray-700/50 rounded'
            variants={shimmer}
            initial='hidden'
            animate='visible'
          />
          <motion.div
            className='h-4 w-64 bg-gray-700/50 rounded'
            variants={shimmer}
            initial='hidden'
            animate='visible'
          />
        </div>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <ChartSkeleton />
    </motion.div>
  </motion.div>
)

const WeeklyCustomers = () => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])

  const parseDate = (dateString) => {
    if (!dateString || dateString === 'Not available') return null
    try {
      // For timestamps in ISO format
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? null : date
      }
      // For formatted date strings
      const date = new Date(dateString.split(' at')[0])
      return isNaN(date.getTime()) ? null : date
    } catch (error) {
      console.error('Error parsing date:', dateString, error)
      return null
    }
  }

  const formatDateKey = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [recentUsersData, allUsersData] = await Promise.all([
          fetchRecentUsers(),
          fetchUsers(),
        ])

        setRecentUsers(recentUsersData)
        setAllUsers(allUsersData)

        // Get array of last 7 days
        const days = [...Array(7)].map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return d
        })

        // Create chart data
        const chartData = days.map((date) => {
          const dayKey = formatDateKey(date)
          const dayStart = new Date(date)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(date)
          dayEnd.setHours(23, 59, 59, 999)

          // Count users created on this specific day using createdAtTimestamp
          const usersOnThisDay = recentUsersData.filter((user) => {
            const createdDate = user.createdAtTimestamp
              ? new Date(user.createdAtTimestamp)
              : parseDate(user.createdAt)

            return (
              createdDate && createdDate >= dayStart && createdDate <= dayEnd
            )
          }).length

          // Count total users up to this day
          const totalUsersToDate = allUsersData.filter((user) => {
            const createdDate = user.createdAtTimestamp
              ? new Date(user.createdAtTimestamp)
              : parseDate(user.createdAt)
            return createdDate && createdDate <= dayEnd
          }).length

          return {
            date: dayKey,
            totalUsers: totalUsersToDate,
            newCustomers: usersOnThisDay,
            dailySignups: usersOnThisDay, // Adding specific daily signup count
          }
        })

        setChartData(chartData)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const stats = useMemo(() => {
    const totalUsers = allUsers.length
    const totalNewCustomers = recentUsers.length

    const lastTwoDays = chartData.slice(-2)
    const growth = {
      total:
        lastTwoDays.length === 2
          ? ((lastTwoDays[1].totalUsers - lastTwoDays[0].totalUsers) /
              Math.max(lastTwoDays[0].totalUsers, 1)) *
            100
          : 0,
      newCustomers:
        lastTwoDays.length === 2
          ? ((lastTwoDays[1].newCustomers - lastTwoDays[0].newCustomers) /
              Math.max(lastTwoDays[0].newCustomers || 1, 1)) *
            100
          : 0,
    }

    return {
      totalUsers,
      totalNewCustomers,
      growth,
    }
  }, [chartData, recentUsers, allUsers])

  if (loading) {
    return <LoadingState />
  }

  return (
    <motion.div
      className='mx-auto max-w-7xl p-4 md:p-6 lg:p-8'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className='overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-lg'>
        <div className='mb-8 flex items-center justify-between'>
          <div className='space-y-1'>
            <h2 className='flex items-center gap-2 text-2xl font-semibold text-white'>
              <Users className='h-6 w-6 text-blue-500' />
              Customer Growth
            </h2>
            <p className='text-sm text-gray-400'>
              Track your total user base and new customer acquisition
            </p>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <motion.div
            className='rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6'
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <p className='text-sm text-gray-400'>Total Users</p>
                <p className='text-2xl font-bold text-white'>
                  {stats.totalUsers}
                </p>
              </div>
              <div className='rounded-full bg-blue-500/20 p-3'>
                <Users className='h-6 w-6 text-blue-500' />
              </div>
            </div>
            <div className='mt-2 flex items-center gap-1'>
              <TrendingUp className='h-4 w-4 text-green-500' />
              <span className='text-sm font-medium text-green-500'>
                +{stats.growth.total.toFixed(1)}%
              </span>
            </div>
          </motion.div>

          <motion.div
            className='rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6'
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <p className='text-sm text-gray-400'>
                  New Customers (Last 7 Days)
                </p>
                <p className='text-2xl font-bold text-white'>
                  {stats.totalNewCustomers}
                </p>
              </div>
              <div className='rounded-full bg-green-500/20 p-3'>
                <UserPlus className='h-6 w-6 text-green-500' />
              </div>
            </div>
            <div className='mt-2 flex items-center gap-1'>
              <TrendingUp className='h-4 w-4 text-green-500' />
              <span className='text-sm font-medium text-green-500'>
                +{stats.growth.newCustomers.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className='h-[400px] w-full rounded-xl bg-gray-800/50 p-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ResponsiveContainer>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#374151'
                opacity={0.5}
              />
              <XAxis
                dataKey='date'
                stroke='#9CA3AF'
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis
                yAxisId='left'
                orientation='left'
                stroke='#9CA3AF'
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                stroke='#9CA3AF'
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className='rounded-lg bg-gray-800 p-4 shadow-lg ring-1 ring-gray-700'>
                        <p className='mb-2 text-sm font-medium text-gray-400'>
                          {label}
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className='flex items-center gap-2 text-sm font-semibold'
                            style={{ color: entry.color }}
                          >
                            {entry.name}: {entry.value}
                            {entry.name === 'Daily Signups' && ' users'}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />

              <Area
                yAxisId='right'
                type='monotone'
                dataKey='dailySignups'
                name='Daily Customers'
                stroke='#10B981'
                fill='url(#colorNew)'
                stackId='2'
              />
              <defs>
                <linearGradient id='colorTotal' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#60A5FA' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#60A5FA' stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id='colorNew' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10B981' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#10B981' stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default WeeklyCustomers
