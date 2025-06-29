import {
  getDatabase,
  limitToLast,
  onChildAdded,
  orderByChild,
  query,
  ref,
  update,
} from 'firebase/database'
import React, { useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function NotificationListener() {
  const [counter, setCounter] = useState()
  const navigate = useNavigate()

  useEffect(() => {
    const db = getDatabase()
    // Reference both detection nodes with query constraints
    const detectionsRef = ref(db, 'detections')
    const unknownDetectionsRef = query(
      ref(db, 'unknown_detections'),
      limitToLast(1) // Only listen to the most recent entry
    )

    // Listener for out of stock detections
    const unsubscribeDetections = onChildAdded(detectionsRef, (snapshot) => {
      const detection = snapshot.val()
      const detectionKey = snapshot.key
      setCounter(detection)

      if (detection.status === 'processed' && !detection.is_viewed) {
        const dbRef = ref(db, `detections/${detectionKey}`)
        update(dbRef, { is_viewed: true })
          .then(() => {
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
                  onClick={() => {
                    toast.dismiss(t.id)
                    navigate(`/notifications/${counter.id}`)
                  }}
                >
                  <div className='flex-1 w-0 p-4'>
                    <div className='flex items-start'>
                      <div className='ml-3 flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          Out of Stock Detection
                        </p>
                        <p className='mt-1 text-sm text-gray-500'>
                          Frame Number: {detection.frame_number}
                          <br />
                          Number of low stock detected: {detection.bbox_count}
                        </p>
                      </div>
                      <img
                        src={detection.image_url}
                        alt='Detection'
                        className='h-20 w-20 rounded-md object-cover'
                      />
                    </div>
                  </div>
                  <div className='flex border-l border-gray-200'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.dismiss(t.id)
                      }}
                      className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
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
          })
          .catch((error) => {
            console.error('Error updating is_viewed:', error)
          })
      }
    })

    // Listener for unknown person detections with immediate notification
    const unsubscribeUnknown = onChildAdded(
      unknownDetectionsRef,
      (snapshot) => {
        const detection = snapshot.val()
        const detectionKey = snapshot.key

        // Check if this is a recent detection (within last 30 seconds)
        const currentTime = Date.now()
        const detectionTime = detection.timestamp || currentTime // Use current time if no timestamp
        const isRecent = currentTime - detectionTime < 30000 // 30 seconds

        if (
          detection.detection_type === 'unknown_person' &&
          !detection.is_viewed &&
          !detection.isvisible &&
          isRecent
        ) {
          const dbRef = ref(db, `unknown_detections/${detectionKey}`)
          update(dbRef, {
            is_viewed: true,
            timestamp: currentTime, // Add timestamp for future reference
          })
            .then(() => {
              toast.custom(
                (t) => (
                  <div
                    className={`${
                      t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-red-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-red-500 ring-opacity-5 cursor-pointer`}
                    onClick={() => {
                      toast.dismiss(t.id)
                      navigate(`/unknown-detections/${detectionKey}`)
                    }}
                  >
                    <div className='flex-1 w-0 p-4'>
                      <div className='flex items-start'>
                        <div className='ml-3 flex-1'>
                          <p className='text-sm font-medium text-red-800'>
                            ⚠️ Unknown Person Detected
                          </p>
                          <p className='mt-1 text-sm text-red-700'>
                            Frame Number: {detection.frame_number}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='flex border-l border-red-200'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toast.dismiss(t.id)
                        }}
                        className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
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
            })
            .catch((error) => {
              console.error('Error updating is_viewed:', error)
            })
        }
      }
    )

    // Cleanup both listeners when component unmounts
    return () => {
      unsubscribeDetections()
      unsubscribeUnknown()
    }
  }, [counter, navigate])

  return <Toaster />
}

export default NotificationListener
