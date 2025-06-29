import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const EditBusiness = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)

  useEffect(() => {
    // Fetch business data based on id
    // This is a mock implementation. Replace with actual API call.
    const fetchedBusiness = {
      id: 1,
      name: 'Cozy Downtown Cafe',
      category: 'Restaurant',
      address: '123 Main St, Cityville',
      description: 'A charming cafe in the heart of downtown.',
    }
    setBusiness(fetchedBusiness)
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBusiness((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Submit updated business data
    // This is a mock implementation. Replace with actual API call.
    console.log('Updated business:', business)
    alert('Your business details have been successfully updated.')
    navigate('//business')
  }

  if (!business) return <div>Loading...</div>

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex items-center mb-6'>
        <button
          onClick={() => navigate('//business')}
          className='mr-4 text-gray-400 hover:text-gray-200'
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className='text-xl font-semibold text-gray-100'>Edit Business</h2>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-300'
          >
            Business Name
          </label>
          <input
            id='name'
            name='name'
            value={business.name}
            onChange={handleInputChange}
            className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          />
        </div>
        <div>
          <label
            htmlFor='category'
            className='block text-sm font-medium text-gray-300'
          >
            Category
          </label>
          <input
            id='category'
            name='category'
            value={business.category}
            onChange={handleInputChange}
            className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          />
        </div>
        <div>
          <label
            htmlFor='address'
            className='block text-sm font-medium text-gray-300'
          >
            Address
          </label>
          <input
            id='address'
            name='address'
            value={business.address}
            onChange={handleInputChange}
            className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          />
        </div>
        <div>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-300'
          >
            Description
          </label>
          <textarea
            id='description'
            name='description'
            value={business.description}
            onChange={handleInputChange}
            className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
            rows={4}
          />
        </div>
        <button
          type='submit'
          className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
        >
          <Save size={18} />
          Save Changes
        </button>
      </form>
    </motion.div>
  )
}

export default EditBusiness
