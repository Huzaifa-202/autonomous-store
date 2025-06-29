import { getDatabase, onChildAdded, ref, update } from 'firebase/database'
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
  Shield,
  User,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

// Custom hook for handling unknown detections
const useUnknownDetections = () => {
  const [detections, setDetections] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const db = getDatabase()
    const detectionsRef = ref(db, 'unknown_detections')

    const unsubscribe = onChildAdded(detectionsRef, (snapshot) => {
      const detection = {
        id: snapshot.key,
        ...snapshot.val(),
        timestamp: new Date(),
        status: 'pending',
      }

      // Update local state
      setDetections((prev) => [detection, ...prev])

      // Show toast notification
      if (!detection.is_viewed) {
        const dbRef = ref(db, `unknown_detections/${snapshot.key}`)
        update(dbRef, { is_viewed: true })

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-gray-700 cursor-pointer`}
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/security')
              }}
            >
              <div className='flex-1 w-0 p-4'>
                <div className='flex items-start'>
                  <div className='ml-3 flex-1'>
                    <p className='text-sm font-medium text-white'>
                      Unknown Person Detected
                    </p>
                    <p className='mt-1 text-sm text-gray-400'>
                      Location: {detection.location}
                      <br />
                      Confidence: {detection.confidence}%
                    </p>
                  </div>
                  {detection.image_url && (
                    <img
                      src={detection.image_url}
                      alt='Detection'
                      className='h-20 w-20 rounded-md object-cover'
                    />
                  )}
                </div>
              </div>
              <div className='flex border-l border-gray-700'>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.dismiss(t.id)
                  }}
                  className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  Close
                </button>
              </div>
            </div>
          ),
          {
            duration: 5000,
            position: 'top-right',
          }
        )
      }
    })

    return () => unsubscribe()
  }, [navigate])

  return detections
}

const Security = () => {
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(true)
  const detections = useUnknownDetections()
  const [unreadAlerts, setUnreadAlerts] = useState(0)

  useEffect(() => {
    setUnreadAlerts(detections.filter((d) => d.status === 'pending').length)
  }, [detections])

  const markAlertHandled = (alertId) => {
    const db = getDatabase()
    const alertRef = ref(db, `unknown_detections/${alertId}`)
    update(alertRef, { status: 'handled' })
      .then(() => {
        setUnreadAlerts((prev) => Math.max(0, prev - 1))
      })
      .catch((error) => {
        console.error('Error updating alert status:', error)
      })
  }

  const getSeverityColor = (confidence) => {
    if (confidence >= 90) return 'bg-red-500'
    if (confidence >= 70) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Toaster />
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
                      Unknown Person Detections
                    </h2>
                  </div>
                  <div className='p-4'>
                    <div className='space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto'>
                      <AnimatePresence>
                        {detections.map((detection) => (
                          <motion.div
                            key={detection.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-lg border transition-colors ${
                              detection.status === 'handled'
                                ? 'bg-gray-800/50 border-gray-700'
                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
                              <div className='flex items-center gap-3'>
                                <span
                                  className={`${getSeverityColor(
                                    detection.confidence
                                  )} px-2 py-1 rounded-full text-xs font-semibold text-white`}
                                >
                                  Confidence: {detection.confidence}%
                                </span>
                                <span className='text-sm text-gray-400 flex items-center gap-1'>
                                  <Clock className='w-4 h-4' />
                                  {formatTime(detection.timestamp)}
                                </span>
                              </div>
                              <div className='flex items-center gap-4 text-gray-300 text-sm'>
                                <div className='flex items-center gap-2'>
                                  <MapPin className='w-4 h-4' />
                                  <span>{detection.location}</span>
                                </div>
                              </div>
                            </div>

                            {detection.image_url && (
                              <div className='mb-4'>
                                <img
                                  src={detection.image_url}
                                  alt='Detection'
                                  className='w-full h-48 object-cover rounded-lg'
                                />
                              </div>
                            )}

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
                              {detection.status === 'pending' && (
                                <button
                                  onClick={() => markAlertHandled(detection.id)}
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
