import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/common/Header'
import { getDatabase, ref, onChildAdded, update } from 'firebase/database'
import { useParams } from 'react-router-dom'

const AdminNotificationPage = () => {
  const [currentImage, setCurrentImage] = useState('')
  const [products, setProducts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [activeTab, setActiveTab] = useState('notifications')
  const [items, setItems] = useState({})
  const params = useParams()
  // console.log(params.id)
  useEffect(() => {
    const db = getDatabase() // Initialize Firebase database
    const detectionsRef = ref(db, 'detections') // Reference to the 'detections' node

    // Attach a listener to detect new children
    const unsubscribe = onChildAdded(detectionsRef, (snapshot) => {
      const detection = snapshot.val() // Retrieve new entry data
      const detectionKey = snapshot.key // Retrieve the key of the new entry
      setItems(detection)
    })
  }, [])

  console.log(items)

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

  const handleSendNotification = async () => {
    if (!selectedProduct) {
      setAlertMessage('Please select a product')
      return
    }

    const product = products.find((p) => p._id === selectedProduct)
    const message =
      customMessage || `${product.name} is out of stock. Please restock.`

    const newNotification = {
      productId: product._id,
      productName: product.name,
      message: message,
      timestamp: new Date().toISOString(),
      status: 'Sent',
    }

    try {
      const response = await fetch(
        'http://localhost:3000/api/sendNotification',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newNotification),
        }
      )

      if (response.ok) {
        const result = await response.json()
        setNotifications([result, ...notifications])
        setAlertMessage('Notification sent successfully')
      } else {
        throw new Error('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      setAlertMessage('Error sending notification: ' + error.message)
    }

    setSelectedProduct('')
    setCustomMessage('')
  }

  // New function to update stock for a product
  const handleUpdateStock = async (productId, currentStock) => {
    const updatedStock = prompt('Enter new stock quantity:', currentStock)

    if (updatedStock === null) return // User canceled

    try {
      const response = await fetch(
        `http://localhost:3000/api/products/${productId}/stock`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currentStock: Number(updatedStock) }),
        }
      )

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? updatedProduct : product
          )
        )
        setAlertMessage('Stock updated successfully')
      } else {
        throw new Error('Failed to update stock')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      setAlertMessage('Error updating stock: ' + error.message)
    }
  }

  // Keep existing useEffect and handler functions...

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  return (
    <div className='min-h-screen bg-gray-900'>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDUwIDAgTCAwIDAgMCA1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      {/* <Header title='Admin Notification Center' /> */}

      <motion.div
        className='relative z-10 p-8 max-w-7xl mx-auto'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <motion.div
          className='flex justify-between items-center mb-8'
          variants={itemVariants}
        >
          <h1 className='text-4xl font-bold text-white'>
            Admin Notification Center
          </h1>
        </motion.div>

        <AnimatePresence>
          {alertMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='bg-blue-500/20 border border-blue-500/50 text-blue-100 p-6 rounded-xl mb-8 backdrop-blur-sm'
            >
              {alertMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'
          variants={itemVariants}
        >
          {/* Notification Form */}
          <motion.div
            className='bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm'
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h2 className='text-2xl font-semibold mb-6 text-white'>
              Send Notification
            </h2>
            <div className='space-y-4'>
              <select
                className='w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value=''>Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} (Stock: {product.currentStock}/
                    {product.threshold})
                  </option>
                ))}
              </select>

              <input
                className='w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 text-white placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                placeholder='Custom message (optional)'
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />

              <motion.button
                className='w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg text-white font-semibold shadow-lg transition-all duration-300'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendNotification}
              >
                Send Notification
              </motion.button>
              {currentImage && (
                <div className='mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm'>
                  <h2 className='text-2xl font-semibold mb-6 text-white'>
                    Detection Image
                  </h2>
                  <img
                    src={currentImage}
                    alt='Detection'
                    className='w-full h-auto rounded-lg object-cover'
                  />
                </div>
              )}

              {/* Add NotificationListener component */}
            </div>
            <img className='object-cover rounded pt-8' src={items.image_url} />
          </motion.div>
          {/* Product Overview */}
          <motion.div
            className='bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm'
            variants={itemVariants}
          >
            <h2 className='text-2xl font-semibold mb-6 text-white'>
              Product Overview
            </h2>
            <div className='overflow-x-auto custom-scrollbar'>
              <table className='w-full'>
                <thead className='border-b border-gray-700/50'>
                  <tr>
                    <th className='text-left py-3 px-4 text-gray-400 font-semibold'>
                      Product
                    </th>
                    <th className='text-left py-3 px-4 text-gray-400 font-semibold'>
                      Stock
                    </th>
                    <th className='text-left py-3 px-4 text-gray-400 font-semibold'>
                      Threshold
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='border-b border-gray-700/30 hover:bg-gray-700/20'
                    >
                      <td className='py-3 px-4 text-white'>{product.name}</td>
                      <td className='py-3 px-4 text-white'>
                        {product.currentStock}
                      </td>
                      <td className='py-3 px-4 text-white'>
                        {product.threshold}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>

        {/* Notifications Table */}
        <motion.div
          className='bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm'
          variants={itemVariants}
        >
          <h2 className='text-2xl font-semibold mb-6 text-white'>
            Sent Notifications
          </h2>
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full'>
              <thead className='border-b border-gray-700/50'>
                <tr>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold'>
                    Product
                  </th>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold'>
                    Message
                  </th>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold'>
                    Timestamp
                  </th>
                  <th className='text-left py-3 px-4 text-gray-400 font-semibold'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification, index) => (
                  <motion.tr
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='border-b border-gray-700/30 hover:bg-gray-700/20'
                  >
                    <td className='py-3 px-4 text-white'>
                      {notification.productName}
                    </td>
                    <td className='py-3 px-4 text-white'>
                      {notification.message}
                    </td>
                    <td className='py-3 px-4 text-gray-400'>
                      {new Date(notification.timestamp).toLocaleString()}
                    </td>
                    <td className='py-3 px-4'>
                      <span className='px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm'>
                        {notification.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  )
}

export default AdminNotificationPage
