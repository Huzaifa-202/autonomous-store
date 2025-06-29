import { getDatabase, onChildAdded, ref } from 'firebase/database'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export const useFirebaseNotifications = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Ensure firebase is initialized before using
    const db = getDatabase()
    const notificationsRef = ref(db, 'notifications')

    // Listen for new child notifications
    const unsubscribe = onChildAdded(notificationsRef, (snapshot) => {
      const newNotification = {
        id: snapshot.key,
        ...snapshot.val(),
      }

      // Add to local state
      setNotifications((prev) => [...prev, newNotification])

      // Show toast notification
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className='flex-1 w-0 p-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0 pt-0.5'>
                  {newNotification.imageUrl ? (
                    <img
                      className='h-10 w-10 rounded-full'
                      src={newNotification.imageUrl}
                      alt='Notification'
                    />
                  ) : (
                    <div className='h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                      {newNotification.productName
                        ? newNotification.productName[0].toUpperCase()
                        : 'N'}
                    </div>
                  )}
                </div>
                <div className='ml-3 flex-1'>
                  <p className='text-sm font-medium text-gray-900'>
                    {newNotification.productName || 'Notification'}
                  </p>
                  <p className='mt-1 text-sm text-gray-500'>
                    {newNotification.message || 'New notification'}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex border-l border-gray-200'>
              <button
                onClick={() => toast.dismiss(t.id)}
                className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000, // 5 seconds
          position: 'top-right',
        }
      )
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  return notifications
}
