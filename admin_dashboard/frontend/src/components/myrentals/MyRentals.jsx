import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  DollarSign,
  Edit,
  MapPin,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

// Mock API functions - replace with actual API calls
const fetchUserRentals = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    {
      id: 1,
      name: 'Islamabad Cash and carry',
      location: 'Islamabad',
      price: 120,
      guests: 2,
      imageUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Ntrgze9QVhTJPmJwTt-dcZr2yGYkS6a71A&s',
    },
    {
      id: 2,
      name: 'Lahore Cash and carry',
      location: 'Lahore',
      price: 200,
      guests: 6,
      imageUrl:
        'https://d2td6mzj4f4e1e.cloudfront.net/wp-content/uploads/sites/9/2017/08/Pic-1-New-layout-of-Blakemore-Wholesales-Wolverhampton-Cash-Carry-depot-1024x683.jpg',
    },
  ]
}

const addRental = async (rental) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { ...rental, id: Date.now() }
}

const deleteRental = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return true
}

const Popup = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className='bg-gray-800 rounded-lg p-6 w-full max-w-md relative'
    >
      <button
        onClick={onClose}
        className='absolute top-2 right-2 text-gray-400 hover:text-white transition duration-300'
      >
        <X className='w-6 h-6' />
      </button>
      {children}
    </motion.div>
  </motion.div>
)

const MyRentals = () => {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentRental, setCurrentRental] = useState(null)
  const [newRental, setNewRental] = useState({
    name: '',
    location: '',
    // price: '',
    guests: '',
    imageUrl: '',
  })

  useEffect(() => {
    const loadRentals = async () => {
      try {
        const fetchedRentals = await fetchUserRentals()
        setRentals(fetchedRentals)
      } catch (error) {
        console.error('Failed to fetch rentals:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRentals()
  }, [])

  const handleAddRental = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const addedRental = await addRental({
        ...newRental,
        imageUrl: 'https://via.placeholder.com/300x200', // Placeholder image
      })
      setRentals([...rentals, addedRental])
      setShowAddForm(false)
      setNewRental({ name: '', location: '', price: '', guests: '' })
    } catch (error) {
      console.error('Failed to add rental:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRental = (rental) => {
    setCurrentRental(rental)
    setShowEditForm(true)
  }

  const handleUpdateRental = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Implement update rental API call here
      const updatedRentals = rentals.map((r) =>
        r.id === currentRental.id ? currentRental : r
      )
      setRentals(updatedRentals)
      setShowEditForm(false)
    } catch (error) {
      console.error('Failed to update rental:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = (rental) => {
    setCurrentRental(rental)
    setShowDeleteConfirm(true)
  }

  const handleDeleteRental = async () => {
    setLoading(true)
    try {
      await deleteRental(currentRental.id)
      setRentals(rentals.filter((rental) => rental.id !== currentRental.id))
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete rental:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-gray-900 min-h-screen'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-white'>My Rentals</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center transition duration-300 ease-in-out transform hover:scale-105'
          >
            <Plus className='w-5 h-5 mr-2' />
            Add New Rental
          </button>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {rentals.map((rental) => (
              <motion.div
                key={rental.id}
                className='bg-gray-800 rounded-lg overflow-hidden shadow-lg transition duration-300 ease-in-out transform hover:scale-105'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <img
                  src={rental.imageUrl}
                  alt={rental.name}
                  className='w-full h-48 object-cover'
                />
                <div className='p-4'>
                  <h3 className='text-lg font-semibold text-white mb-1'>
                    {rental.name}
                  </h3>
                  <p className='text-sm text-gray-400 mb-2 flex items-center'>
                    <MapPin className='w-4 h-4 mr-1' /> {rental.location}
                  </p>
                  <div className='flex justify-between items-center mb-4'>
                    <span className='text-green-400 font-bold'>
                      ${rental.price} / month
                    </span>
                    <span className='flex items-center text-gray-400'>
                      <Users className='w-4 h-4 mr-1' /> {rental.guests} Cameras
                    </span>
                  </div>
                  <div className='flex justify-between space-x-2'>
                    <button
                      className='flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition duration-300 ease-in-out'
                      onClick={() => handleEditRental(rental)}
                    >
                      <Edit className='w-4 h-4 mr-2' />
                      Edit
                    </button>
                    <button
                      className='flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition duration-300 ease-in-out'
                      onClick={() => handleDeleteConfirm(rental)}
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && rentals.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg mb-4'>
              You haven't added any rentals yet.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center mx-auto transition duration-300 ease-in-out transform hover:scale-105'
            >
              <Plus className='w-5 h-5 mr-2' />
              Add Your First Rental
            </button>
          </div>
        )}

        <AnimatePresence>
          {showAddForm && (
            <Popup onClose={() => setShowAddForm(false)}>
              <h2 className='text-xl font-bold text-white mb-4'>
                Add New Rental
              </h2>
              <form onSubmit={handleAddRental} className='space-y-4'>
                <input
                  type='text'
                  placeholder='Rental Name'
                  className='w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                  value={newRental.name}
                  onChange={(e) =>
                    setNewRental({ ...newRental, name: e.target.value })
                  }
                  required
                />
                <input
                  type='text'
                  placeholder='Location'
                  className='w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                  value={newRental.location}
                  onChange={(e) =>
                    setNewRental({ ...newRental, location: e.target.value })
                  }
                  required
                />
                <div className='flex space-x-4'>
                  <input
                    type='number'
                    placeholder='Price per Night'
                    className='w-1/2 bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                    value={newRental.price}
                    onChange={(e) =>
                      setNewRental({ ...newRental, price: e.target.value })
                    }
                    required
                  />
                  <input
                    type='number'
                    placeholder='Max Guests'
                    className='w-1/2 bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                    value={newRental.guests}
                    onChange={(e) =>
                      setNewRental({ ...newRental, guests: e.target.value })
                    }
                    required
                  />
                </div>
                <button
                  type='submit'
                  className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105'
                >
                  Add Rental
                </button>
              </form>
            </Popup>
          )}

          {showEditForm && (
            <Popup onClose={() => setShowEditForm(false)}>
              <h2 className='text-xl font-bold text-white mb-4'>Edit Rental</h2>
              <form onSubmit={handleUpdateRental} className='space-y-4'>
                <input
                  type='text'
                  placeholder='Rental Name'
                  className='w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                  value={currentRental.name}
                  onChange={(e) =>
                    setCurrentRental({ ...currentRental, name: e.target.value })
                  }
                  required
                />
                <input
                  type='text'
                  placeholder='Location'
                  className='w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                  value={currentRental.location}
                  onChange={(e) =>
                    setCurrentRental({
                      ...currentRental,
                      location: e.target.value,
                    })
                  }
                  required
                />
                <div className='flex space-x-4'>
                  <input
                    type='number'
                    placeholder='Price per Night'
                    className='w-1/2 bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                    value={currentRental.price}
                    onChange={(e) =>
                      setCurrentRental({
                        ...currentRental,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type='number'
                    placeholder='Max Guests'
                    className='w-1/2 bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                    value={currentRental.guests}
                    onChange={(e) =>
                      setCurrentRental({
                        ...currentRental,
                        guests: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <input
                  type='text'
                  placeholder='Image URL'
                  className='w-full bg-gray-700 text-white rounded-md border-gray-600 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                  value={currentRental.imageUrl}
                  onChange={(e) =>
                    setCurrentRental({
                      ...currentRental,
                      imageUrl: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type='submit'
                  className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105'
                >
                  Update Rental
                </button>
              </form>
            </Popup>
          )}

          {showDeleteConfirm && (
            <Popup onClose={() => setShowDeleteConfirm(false)}>
              <h2 className='text-xl font-bold text-white mb-4'>
                Confirm Deletion
              </h2>
              <p className='text-gray-300 mb-4'>
                Are you sure you want to delete "{currentRental.name}"? This
                action cannot be undone.
              </p>
              <div className='flex justify-end space-x-4'>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRental}
                  className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out'
                >
                  Delete
                </button>
              </div>
            </Popup>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MyRentals
