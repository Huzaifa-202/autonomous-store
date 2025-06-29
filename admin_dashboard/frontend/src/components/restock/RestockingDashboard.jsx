import {
  AnimatePresence,
  motion,
  useTransform,
  useViewportScroll,
} from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const RestockingDashboard = () => {
  const [products, setProducts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [alertMessage, setAlertMessage] = useState('')
  const [selectedChart, setSelectedChart] = useState('bar')
  const navigate = useNavigate()
  const { scrollYProgress } = useViewportScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  // Fetch data useEffect remains the same...
  // handleRestockRequest remains the same...
  // handleLogout remains the same...

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products')
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
        setAlertMessage('Error fetching products. Please try again.')
      }
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/notifications')
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        setNotifications(data)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setAlertMessage('Error fetching notifications. Please try again.')
      }
    }

    fetchProducts()
    fetchNotifications()
  }, [])

  const handleRestockRequest = async (productId) => {
    const product = products.find((p) => p._id === productId)
    const message = `Restock request sent for ${product.name}`

    try {
      const response = await fetch(
        'http://localhost:8800/api/sendNotification',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product._id,
            productName: product.name,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'Sent',
          }),
        }
      )

      if (response.ok) {
        const newNotification = await response.json()
        setNotifications((prev) => [newNotification, ...prev])
        setAlertMessage('Restock request sent successfully')
      } else {
        throw new Error('Failed to send restock request')
      }
    } catch (error) {
      console.error('Error sending restock request:', error)
      setAlertMessage('Error sending restock request: ' + error.message)
    }
  }

  const handleLogout = () => {
    navigate('/login')
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDUwIDAgTCAwIDAgMCA1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <motion.div
        style={{ opacity }}
        className='relative z-10 p-8 max-w-7xl mx-auto'
      >
        {/* Header Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className='flex justify-between items-center mb-12'
        >
          <div className='space-y-2'>
            <motion.h1
              className='text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400'
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Restocking Dashboard
            </motion.h1>
            <p className='text-gray-400'>
              Real-time inventory management system
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className='bg-gradient-to-r from-red-500 to-pink-500 px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-pink-500/25 transition-all duration-300'
          >
            Logout
          </motion.button>
        </motion.div>

        {/* Alert Message */}
        <AnimatePresence>
          {alertMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 text-blue-100 p-6 rounded-2xl mb-8 backdrop-blur-lg'
            >
              {alertMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='grid grid-cols-1 lg:grid-cols-2 gap-8'
        >
          {/* Chart Section */}
          <motion.div
            variants={itemVariants}
            className='lg:col-span-2 bg-gray-800/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-700/50'
          >
            <div className='flex justify-between items-center mb-8'>
              <h2 className='text-3xl font-semibold text-white'>
                Inventory Overview
              </h2>
              <div className='flex gap-4'>
                <button
                  onClick={() => setSelectedChart('bar')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    selectedChart === 'bar'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Bar Chart
                </button>
                <button
                  onClick={() => setSelectedChart('area')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    selectedChart === 'area'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Area Chart
                </button>
              </div>
            </div>

            <div className='h-[400px]'>
              <ResponsiveContainer width='100%' height='100%'>
                {selectedChart === 'bar' ? (
                  <BarChart data={products}>
                    <defs>
                      <linearGradient
                        id='stockGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='0%'
                          stopColor='#8B5CF6'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='100%'
                          stopColor='#6366F1'
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                      <linearGradient
                        id='thresholdGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='0%'
                          stopColor='#EC4899'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='100%'
                          stopColor='#EF4444'
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='#374151'
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey='name'
                      stroke='#9CA3AF'
                      tick={{ fill: '#9CA3AF' }}
                      tickLine={{ stroke: '#9CA3AF' }}
                    />
                    <YAxis
                      stroke='#9CA3AF'
                      tick={{ fill: '#9CA3AF' }}
                      tickLine={{ stroke: '#9CA3AF' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        borderRadius: '0.75rem',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#fff' }}
                      iconType='circle'
                    />
                    <Bar
                      dataKey='currentStock'
                      fill='url(#stockGradient)'
                      name='Current Stock'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='threshold'
                      fill='url(#thresholdGradient)'
                      name='Threshold'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <AreaChart data={products}>
                    <defs>
                      <linearGradient
                        id='areaStock'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='0%'
                          stopColor='#8B5CF6'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='100%'
                          stopColor='#6366F1'
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id='areaThreshold'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='0%'
                          stopColor='#EC4899'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='100%'
                          stopColor='#EF4444'
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='#374151'
                      opacity={0.3}
                    />
                    <XAxis dataKey='name' stroke='#9CA3AF' />
                    <YAxis stroke='#9CA3AF' />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        borderRadius: '0.75rem',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='currentStock'
                      stroke='#8B5CF6'
                      fill='url(#areaStock)'
                      name='Current Stock'
                    />
                    <Area
                      type='monotone'
                      dataKey='threshold'
                      stroke='#EC4899'
                      fill='url(#areaThreshold)'
                      name='Threshold'
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            variants={itemVariants}
            className='lg:col-span-2 bg-gray-800/40 p-8 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-700/50'
          >
            <h2 className='text-3xl font-semibold text-white mb-8'>
              Notifications
            </h2>
            <div className='space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4'>
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-6 rounded-xl border border-gray-600/50 hover:border-violet-500/50 transition-all duration-300'
                  >
                    <p className='text-gray-100 text-lg'>
                      {notification.message}
                    </p>
                    <p className='text-sm text-gray-400 mt-2 font-mono'>
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            rgba(139, 92, 246, 0.5),
            rgba(236, 72, 153, 0.5)
          );
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            rgba(139, 92, 246, 0.8),
            rgba(236, 72, 153, 0.8)
          );
        }
      `}</style>
    </div>
  )
}

export default RestockingDashboard
