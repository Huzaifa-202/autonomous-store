import { Timestamp } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2, User, UserPlus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import { db } from '../firebase/firebase'
import { addUser, deleteUser, fetchUsers } from '../services/fetchUsers'

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    DOB: '',
    imageUrl: '',
    creditCardNumber: '',
    creditCardExpiry: '',
    creditCardCVC: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Format credit card expiry date correctly
      let creditCardExpiryDate = null
      if (formData.creditCardExpiry) {
        // Add day to the month input to create a valid date
        creditCardExpiryDate = new Date(formData.creditCardExpiry + '-01')
        // Set to last day of the month
        creditCardExpiryDate.setMonth(creditCardExpiryDate.getMonth() + 1, 0)
      }

      const userData = {
        ...formData,
        DOB: formData.DOB ? Timestamp.fromDate(new Date(formData.DOB)) : null,
        registrationDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        numberOfVisits: 0,
        lastVisitedTime: null,
        // Handle credit card expiry date properly
        creditCardExpiry: creditCardExpiryDate
          ? Timestamp.fromDate(creditCardExpiryDate)
          : null,
        // Remove the raw date strings from the data
        creditCardNumber: formData.creditCardNumber || null,
        creditCardCVC: formData.creditCardCVC || null,
      }

      // Clean up any empty or null values
      Object.keys(userData).forEach((key) =>
        userData[key] === '' || userData[key] === null
          ? delete userData[key]
          : {}
      )

      await onAddUser(userData)
      onClose()

      // Reset form
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        DOB: '',
        imageUrl: '',
        creditCardNumber: '',
        creditCardExpiry: '',
        creditCardCVC: '',
      })
    } catch (error) {
      console.error('Error adding user:', error)
      // You might want to show this error to the user
      alert('Error adding user: ' + error.message)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='fixed inset-0  backdrop-blur-sm flex justify-center items-center z-50 p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className=' rounded-lg p-6 w-full max-w-md border border-gray-700'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-2xl font-bold mb-4 text-white'>Add New User</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <input
              type='text'
              name='firstname'
              placeholder='First Name'
              value={formData.firstname}
              onChange={handleChange}
              className='bg-gray-700 border-gray-600 text-white placeholder-gray-400 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
            <input
              type='text'
              name='lastname'
              placeholder='Last Name'
              value={formData.lastname}
              onChange={handleChange}
              className='bg-gray-700 border-gray-600 text-white placeholder-gray-400 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
          </div>
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            className='w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            required
          />
          <input
            type='tel'
            name='phoneNumber'
            placeholder='Phone Number'
            value={formData.phoneNumber}
            onChange={handleChange}
            className='w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <div>
            <label className='block text-gray-300 mb-1'>Date of Birth</label>
            <input
              type='date'
              name='DOB'
              value={formData.DOB}
              onChange={handleChange}
              className='w-full bg-gray-700 border-gray-600 text-white border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <input
            type='url'
            name='imageUrl'
            placeholder='Profile Image URL (Optional)'
            value={formData.imageUrl}
            onChange={handleChange}
            className='w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <div className='grid grid-cols-3 gap-4'>
            <input
              type='text'
              name='creditCardNumber'
              placeholder='Card Number'
              value={formData.creditCardNumber}
              onChange={handleChange}
              className='bg-gray-700 border-gray-600 text-white placeholder-gray-400 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <input
              type='month'
              name='creditCardExpiry'
              placeholder='Expiry'
              value={formData.creditCardExpiry}
              onChange={handleChange}
              className='bg-gray-700 border-gray-600 text-white border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <input
              type='text'
              name='creditCardCVC'
              placeholder='CVC'
              value={formData.creditCardCVC}
              onChange={handleChange}
              className='bg-gray-700 border-gray-600 text-white placeholder-gray-400 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={onClose}
              className='bg-gray-700 text-gray-200 px-4 py-2 rounded hover:bg-gray-600 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
            >
              Add User
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

const UserManagement = ({ onUserCountChange }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [length, setLength] = useState(0)
  const loadUsers = async () => {
    try {
      setLoading(true)
      const fetchedUsers = await fetchUsers()
      setUsers(fetchedUsers)
      // Call the callback with the new user count
      onUserCountChange?.(fetchedUsers.length)
      setError(null)
    } catch (err) {
      setError('Failed to fetch users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  console.log(users)
  const handleAddUser = async (userData) => {
    try {
      await addUser(userData)
      await loadUsers()
    } catch (err) {
      setError('Failed to add user')
      console.error(err)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId)
      const updatedUsers = users.filter((user) => user.id !== userId)
      setUsers(updatedUsers)
      onUserCountChange?.(updatedUsers.length)
    } catch (err) {
      setError('Failed to delete user')
      console.error(err)
    }
  }

  const toggleUserExpansion = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='flex justify-center items-center h-screen '
      >
        <div className='text-center'>
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4'
          />
          <p className='text-gray-400'>Loading Users...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded relative m-4'
      >
        {error}
      </motion.div>
    )
  }

  return (
    <div className='flex-1 overflow-auto relative z-10  p-6'>
      <div className='container mx-auto px-4 py-8'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex justify-between items-center mb-6'
        >
          <h1 className='text-3xl font-bold text-white'>User Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddUserModalOpen(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
          >
            <UserPlus size={20} />
            Add User
          </motion.button>
        </motion.div>

        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onAddUser={handleAddUser}
        />

        <AnimatePresence>
          {users.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-center text-gray-400 py-8'
            >
              No users found
            </motion.div>
          ) : (
            <motion.div layout className='space-y-4'>
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className='bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700'
                >
                  <div
                    onClick={() => toggleUserExpansion(user.id)}
                    className='flex items-center p-4 cursor-pointer hover:bg-gray-700/50 transition-colors'
                  >
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={`${user.firstname} ${user.lastname}`}
                        className='w-12 h-12 rounded-full mr-4 object-cover bg-gray-700'
                      />
                    ) : (
                      <div className='w-12 h-12 bg-gray-700 rounded-full mr-4 flex items-center justify-center'>
                        <User size={24} className='text-gray-400' />
                      </div>
                    )}
                    <div className='flex-grow'>
                      <h2 className='text-lg font-semibold text-white'>
                        {user.firstname} {user.lastname}
                      </h2>
                      <p className='text-gray-400'>{user.email}</p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteUser(user.id)
                        }}
                        className='bg-red-600/20 text-red-400 p-2 rounded-lg hover:bg-red-600/30 transition-colors'
                      >
                        <Trash2 size={20} />
                      </motion.button>
                      {expandedUserId === user.id ? (
                        <ChevronUp className='text-gray-400' />
                      ) : (
                        <ChevronDown className='text-gray-400' />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedUserId === user.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className='p-4 bg-gray-700/30 border-t border-gray-700'
                      >
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <p className='text-gray-400'>Phone Number</p>
                            <p className='text-white'>
                              {user.phoneNumber || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className='text-gray-400'>Visits</p>
                            <p className='text-white'>{user.numberOfVisits}</p>
                          </div>
                          <div>
                            <p className='text-gray-400'>Registration Date</p>
                            <p className='text-white'>
                              {user.registrationDate}
                            </p>
                          </div>
                          <div>
                            <p className='text-gray-400'>Date of Birth</p>
                            <p className='text-white'>{user.DOB}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination or Load More Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='mt-6 flex justify-center'
      >
        {users.length > 0 && (
          <button
            onClick={loadUsers}
            className='bg-gray-800 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2'
          >
            Refresh Users
          </button>
        )}
      </motion.div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className='fixed bottom-4 right-4 bg-red-900/80 text-white px-6 py-3 rounded-lg shadow-lg border border-red-700'
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
    </div>
  )
}

export default UserManagement
