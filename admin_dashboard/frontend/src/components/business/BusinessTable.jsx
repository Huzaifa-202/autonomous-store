import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Papa from 'papaparse'
import { motion } from 'framer-motion'
// import Header from '../components/'
import { ChevronDown } from 'lucide-react'

const SalesPrediction = () => {
  const [csvData, setCsvData] = useState(null)
  const [plotImageUrl, setPlotImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [predictionPeriod, setPredictionPeriod] = useState('1 year')

  const fetchData = async (period) => {
    try {
      setLoading(true)
      // Fetch CSV file URL
      const csvResponse = await axios.get(
        `http://127.0.0.1:8000/download/csv/${period}`
      )
      const csvFileUrl = csvResponse.data.csv_file_url

      // Fetch the CSV file from the Cloudinary URL
      const csvDataResponse = await axios.get(csvFileUrl, {
        responseType: 'blob',
      })
      const csvBlob = csvDataResponse.data

      // Parse the CSV file
      Papa.parse(csvBlob, {
        complete: (result) => {
          setCsvData(result.data)
          setLoading(false)
        },
        header: true,
        error: (err) => {
          console.error('Error parsing CSV:', err)
          setError('Error parsing CSV data')
        },
      })

      // Fetch Plot Image URL
      const plotResponse = await axios.get(
        `http://127.0.0.1:8000/download/plot/${period}`
      )
      const plotImageUrl = plotResponse.data.plot_image_url
      setPlotImageUrl(plotImageUrl)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data from the server')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(predictionPeriod)
  }, [predictionPeriod])

  const handlePeriodChange = (e) => {
    setPredictionPeriod(e.target.value)
  }

  if (loading) {
    return (
      <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
        <Header title='Admin Notifications' />
        <motion.div
          className='flex items-center justify-center min-h-screen'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className='text-center'>
            <div className='loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4'></div>
            <h2 className='text-xl font-semibold text-white'>
              Loading data...
            </h2>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
        <motion.div
          className='flex items-center justify-center min-h-screen text-red-500'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h2>{error}</h2>
        </motion.div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title='Admin Notifications' />
      <motion.div
        className='container mx-auto mt-10 px-4'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-white'>Sales Prediction</h1>
          <div className='relative'>
            <select
              value={predictionPeriod}
              onChange={handlePeriodChange}
              className='appearance-none bg-gray-700 text-white py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='1 month'>1 Month</option>
              <option value='3 months'>3 Months</option>
              <option value='6 months'>6 Months</option>
              <option value='1 year'>1 Year</option>
              <option value='2 years'>2 Years</option>
            </select>
            <ChevronDown
              className='absolute right-2 top-2.5 text-gray-400 pointer-events-none'
              size={20}
            />
          </div>
        </div>

        {/* Plot Image */}
        {plotImageUrl && (
          <motion.div
            className='mb-8'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={plotImageUrl}
              alt='Sales Prediction Plot'
              className='w-full h-auto rounded-lg border-2 border-gray-700 hover:border-blue-500 transition-colors duration-300'
            />
          </motion.div>
        )}

        {/* CSV Table */}
        {csvData && (
          <div className='overflow-x-auto bg-gray-800 rounded-lg shadow-lg'>
            <table className='min-w-full divide-y divide-gray-700'>
              <thead className='bg-gray-700'>
                <tr>
                  {Object.keys(csvData[0]).map((key) => (
                    <th
                      key={key}
                      className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-gray-800 divide-y divide-gray-700'>
                {csvData.map((row, index) => (
                  <tr
                    key={index}
                    className='hover:bg-gray-700 transition-colors duration-200'
                  >
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default SalesPrediction
