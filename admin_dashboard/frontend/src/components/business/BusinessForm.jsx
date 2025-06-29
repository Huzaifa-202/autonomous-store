import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

const BusinessForm = ({ business, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    price: '',
    stock: '',
    sales: '',
  })

  useEffect(() => {
    if (business) {
      setFormData(business)
    }
  }, [business])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 '>
      <div className='flex justify-between items-center mb-4 z-auto'>
        <h2 className='text-xl font-semibold text-gray-100'>
          {business ? 'Edit Business' : 'Add Business'}
        </h2>
        <button
          type='button'
          onClick={onClose}
          className='text-gray-400 hover:text-gray-200'
        >
          <X size={24} />
        </button>
      </div>

      <div>
        <label
          htmlFor='name'
          className='block text-sm font-medium text-gray-300'
        >
          Business Name
        </label>
        <input
          type='text'
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          required
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
          type='text'
          id='category'
          name='category'
          value={formData.category}
          onChange={handleChange}
          className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          required
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
          type='text'
          id='address'
          name='address'
          value={formData.address}
          onChange={handleChange}
          className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          required
        />
      </div>

      <div>
        <label
          htmlFor='price'
          className='block text-sm font-medium text-gray-300'
        >
          Price
        </label>
        <input
          type='number'
          id='price'
          name='price'
          value={formData.price}
          onChange={handleChange}
          className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          required
        />
      </div>

      <div>
        <label
          htmlFor='stock'
          className='block text-sm font-medium text-gray-300'
        >
          Stock
        </label>
        <input
          type='number'
          id='stock'
          name='stock'
          value={formData.stock}
          onChange={handleChange}
          className='mt-1 block w-full bg-gray-700 text-white rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          required
        />
      </div>

      <div className='flex justify-end space-x-3'>
        <button
          type='button'
          onClick={onClose}
          className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default BusinessForm
