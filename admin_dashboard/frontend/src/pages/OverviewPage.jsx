import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, ShoppingBag, TrendingUp, Users, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import DailyBookings from '../components/bookings/DailyBookings'
import Header from '../components/common/Header'
import EmailData from '../components/overview/EmailData'
import SalesOverviewChart from '../components/overview/SalesOverviewChart'

const shimmer = {
  hidden: {
    opacity: 0.3,
  },
  visible: {
    opacity: 0.7,
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
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
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
    className='overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg ring-1 ring-gray-700/50'
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
          className='h-8 w-32 bg-gray-700/50 rounded'
          variants={shimmer}
          initial='hidden'
          animate='visible'
        />
        <motion.div
          className='h-3 w-40 bg-gray-700/50 rounded'
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
  </motion.div>
)

const ChartSkeleton = () => (
  <motion.div
    variants={itemVariants}
    className='overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg ring-1 ring-gray-700/50'
  >
    <div className='space-y-4'>
      <motion.div
        className='h-8 w-48 bg-gray-700/50 rounded'
        variants={shimmer}
        initial='hidden'
        animate='visible'
      />
      <motion.div
        className='h-[300px] w-full bg-gray-700/50 rounded'
        variants={shimmer}
        initial='hidden'
        animate='visible'
      />
    </div>
  </motion.div>
)

const LoadingState = () => (
  <div className='min-h-screen bg-gray-900'>
    <div className='flex-1 overflow-auto relative z-10'>
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <motion.div
            className='h-8 w-48 bg-gray-700/50 rounded mb-2'
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
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='show'
          className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'
        >
          {[...Array(3)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='show'
          className='space-y-6'
        >
          {[...Array(3)].map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </motion.div>
      </main>
    </div>
  </div>
)

const OverviewPage = () => {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState({
    totalSales: 0,
    yearlyGrowth: 15.7,
    predictiveGrowth: 8.3,
  })

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleTotalSalesUpdate = (totalSales) => {
    setOverviewData((prev) => ({ ...prev, totalSales }))
  }

  if (loading) {
    return <LoadingState />
  }

  const StatCard = ({
    name,
    icon: Icon,
    value,
    growth,
    color,
    description,
  }) => (
    <motion.div
      className='overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg ring-1 ring-gray-700/50'
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <p className='text-sm text-gray-400'>{name}</p>
          <p className='text-2xl font-bold text-white'>{value}</p>
          {description && (
            <p className='text-xs text-gray-500'>{description}</p>
          )}
        </div>
        <div
          className={`rounded-full bg-opacity-20 p-3`}
          style={{ backgroundColor: `${color}30` }}
        >
          <Icon className='h-6 w-6' style={{ color }} />
        </div>
      </div>
    </motion.div>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      <div className='flex-1 overflow-auto relative z-10'>
        <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-8'
          >
            <h1 className='text-2xl font-bold text-white mb-2'>
              Welcome back 👋
            </h1>
            <p className='text-gray-400'>
              Here's what's happening with your store today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='show'
            className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8'
          >
            <motion.div variants={itemVariants}>
              <StatCard
                name=' Total Sales'
                value='Rs. 3,50,345'
                icon={Zap}
                growth={overviewData.predictiveGrowth}
                color='#EC4899'
                description='Total sales for current period'
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatCard
                name='Yearly Sales'
                icon={Users}
                value='Rs.45,965'
                growth={overviewData.yearlyGrowth}
                color='#8B5CF6'
                description='Cumulative yearly performance'
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                name='Predicted Sales'
                icon={ShoppingBag}
                value={`PKR ${Math.round(
                  overviewData.totalSales
                ).toLocaleString('en-IN')}`}
                growth='12.5'
                color='#6366F1'
                description='AI-powered sales forecast'
              />
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='show'
            className='space-y-6'
          >
            <motion.div variants={itemVariants}>
              <EmailData />
            </motion.div>

            <motion.div variants={itemVariants}>
              <SalesOverviewChart onTotalSalesUpdate={handleTotalSalesUpdate} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DailyBookings />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default OverviewPage
