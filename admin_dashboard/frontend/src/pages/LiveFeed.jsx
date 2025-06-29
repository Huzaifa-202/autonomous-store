import { AnimatePresence, motion } from 'framer-motion'
import { Activity, TrendingDown, TrendingUp, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const LiveStatCard = ({ name, icon: Icon, color }) => {
  const [count, setCount] = useState(0)
  const [lastCount, setLastCount] = useState(0)
  const [trend, setTrend] = useState(0) // Positive for increase, negative for decrease

  useEffect(() => {
    const fetchLatestCustomerData = async () => {
      try {
        const response = await fetch(
          'http://localhost:8800/api/customers/latest'
        )
        const data = await response.json()
        if (data?.total_persons !== count) {
          setLastCount(count)
          setTrend(data.total_persons > count ? 1 : -1)
          setCount(data.total_persons)
        }
      } catch (error) {
        console.error('Error fetching customer data:', error)
      }
    }

    const interval = setInterval(fetchLatestCustomerData, 3000)
    return () => clearInterval(interval)
  }, [count])

  const getChangePercentage = () => {
    if (lastCount === 0) return 0
    return (((count - lastCount) / lastCount) * 100).toFixed(1)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className='relative p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden'
    >
      {/* Background Pulse Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse-slow' />

      {/* Live Indicator */}
      <div className='absolute top-4 right-4 flex items-center gap-2'>
        <span className='relative flex h-2 w-2'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' />
          <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500' />
        </span>
        <span className='text-xs text-gray-400'>LIVE</span>
      </div>

      <div className='relative space-y-4'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <div
            className='p-2 rounded-lg'
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className='w-5 h-5' style={{ color }} />
          </div>
          <span className='text-gray-400 text-sm font-medium'>{name}</span>
        </div>

        {/* Counter */}
        <div className='space-y-2'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={count}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className='flex items-end gap-3'
            >
              <span className='text-3xl font-bold text-gray-100'>
                {count.toLocaleString()}
              </span>

              {lastCount !== count && (
                <div className='flex items-center gap-1 text-sm'>
                  {trend > 0 ? (
                    <TrendingUp className='w-4 h-4 text-green-400' />
                  ) : (
                    <TrendingDown className='w-4 h-4 text-red-400' />
                  )}
                  <span
                    className={trend > 0 ? 'text-green-400' : 'text-red-400'}
                  >
                    {Math.abs(getChangePercentage())}%
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Update Pulse Effect */}
      {lastCount !== count && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1 }}
          className='absolute inset-0 rounded-xl'
          style={{ backgroundColor: `${color}10` }}
        />
      )}
    </motion.div>
  )
}

export default LiveStatCard
