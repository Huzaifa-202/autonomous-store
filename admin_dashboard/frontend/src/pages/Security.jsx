import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Send,
  Shield,
  User,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

const Security = () => {
  const [activeChats, setActiveChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [alerts, setAlerts] = useState([])
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const locations = [
          'Main Entrance',
          'Parking Lot',
          'Side Door',
          'Loading Dock',
        ]
        const severityLevels = ['high', 'medium', 'low']
        const newAlert = {
          id: Date.now(),
          timestamp: new Date(),
          personId: Math.floor(Math.random() * 1000),
          location: locations[Math.floor(Math.random() * locations.length)],
          severity:
            severityLevels[Math.floor(Math.random() * severityLevels.length)],
          status: 'pending',
          type: 'unknown_person',
        }
        setAlerts((prev) => [newAlert, ...prev])
        setUnreadAlerts((prev) => prev + 1)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    }
    return colors[severity] || 'bg-gray-500'
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const markAlertHandled = (alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: 'handled' } : alert
      )
    )
    setUnreadAlerts((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
        {/* Header */}
        <header className='sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur'>
          <div className='px-4 sm:px-6 py-4'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-3'>
                <Shield className='w-6 h-6 sm:w-8 sm:h-8 text-blue-500' />
                <div>
                  <h1 className='text-xl sm:text-2xl font-bold text-white'>
                    Security Dashboard
                  </h1>
                  <p className='text-xs sm:text-sm text-gray-400'>
                    Real-time monitoring and response
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAlertsPanelOpen(!isAlertsPanelOpen)}
                className='relative p-2 rounded-full hover:bg-gray-800 transition-colors'
              >
                <Bell className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400' />
                {unreadAlerts > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                    {unreadAlerts}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='px-4 sm:px-6 py-4'>
          <AnimatePresence>
            {isAlertsPanelOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='w-full'
              >
                <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-xl'>
                  <div className='border-b border-gray-800 p-4'>
                    <h2 className='text-lg sm:text-xl font-semibold text-white flex items-center gap-2'>
                      <AlertTriangle className='w-5 h-5 text-yellow-500' />
                      Active Alerts
                    </h2>
                  </div>
                  <div className='p-4'>
                    <div className='space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto'>
                      <AnimatePresence>
                        {alerts.map((alert) => (
                          <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-lg border transition-colors ${
                              alert.status === 'handled'
                                ? 'bg-gray-800/50 border-gray-700'
                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
                              <div className='flex items-center gap-3'>
                                <span
                                  className={`${getSeverityColor(
                                    alert.severity
                                  )} px-2 py-1 rounded-full text-xs font-semibold text-white`}
                                >
                                  {alert.severity.toUpperCase()} PRIORITY
                                </span>
                                <span className='text-sm text-gray-400 flex items-center gap-1'>
                                  <Clock className='w-4 h-4' />
                                  {formatTime(alert.timestamp)}
                                </span>
                              </div>
                              <div className='flex items-center gap-4 text-gray-300 text-sm'>
                                <div className='flex items-center gap-2'>
                                  <User className='w-4 h-4' />
                                  <span>ID: {alert.personId}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <MapPin className='w-4 h-4' />
                                  <span>{alert.location}</span>
                                </div>
                              </div>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-3 sm:justify-between'>
                              <div className='flex gap-2'>
                                <button className='bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors flex items-center gap-2'>
                                  <Camera className='w-4 h-4' />
                                  View Feed
                                </button>
                                <button className='bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors flex items-center gap-2'>
                                  <MessageSquare className='w-4 h-4' />
                                  Add Note
                                </button>
                              </div>
                              {alert.status === 'pending' && (
                                <button
                                  onClick={() => markAlertHandled(alert.id)}
                                  className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center'
                                >
                                  <CheckCircle className='w-4 h-4' />
                                  Mark Handled
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default Security
