import axios from 'axios'
import { motion } from 'framer-motion'
import { BarChart2, Calendar, PlusCircle } from 'lucide-react'
import Papa from 'papaparse'
import React, { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const Header = ({ title }) => (
  <h1 className='text-3xl font-bold mb-6 flex items-center'>
    <BarChart2 className='mr-2' /> {title}
  </h1>
)

const ForecastGraph = () => {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const [forecastPeriod, setForecastPeriod] = useState('1 month')
  const [productsInput, setProductsInput] = useState('Milk, Toothpaste')
  const [products, setProducts] = useState(['Milk', 'Toothpaste'])
  const [productTotals, setProductTotals] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8080/predict', {
        forecast_period: forecastPeriod,
        products: products,
      })
      console.log(response)
      const csvFilePath = response.data.csv_file_url

      if (!csvFilePath) {
        throw new Error('CSV file path is undefined.')
      }

      const csvResponse = await axios.get(`${csvFilePath}`, {
        responseType: 'blob',
      })

      Papa.parse(csvResponse.data, {
        header: true,
        complete: (result) => {
          const parsedData = result.data.map((row) => ({
            ds: new Date(row.ds).toLocaleDateString(),
            ...products.reduce(
              (acc, product) => ({
                ...acc,
                [product]: parseFloat(row[product]),
              }),
              {}
            ),
          }))
          setData(parsedData)

          // Calculate totals for each product
          const totals = products.reduce((acc, product) => {
            const sum = parsedData.reduce(
              (sum, row) => sum + (row[product] || 0),
              0
            )
            return { ...acc, [product]: sum.toFixed(2) }
          }, {})
          setProductTotals(totals)
          setLoading(false)
        },
      })
    } catch (error) {
      console.error('Error fetching and parsing CSV:', error)
      setError('Error fetching data from server.')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isDialogOpen) {
      fetchData()
    }
  }, [isDialogOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    setProducts(productsInput.split(',').map((item) => item.trim()))
    setIsDialogOpen(false)
  }

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE']

  if (loading) {
    return (
      <div className='flex-1 overflow-auto relative z-10 '>
        <Header title='Product Prediction' />
        <motion.div
          className='flex items-center justify-center min-h-screen'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className='text-center'>
            <div className='flex justify-center items-center mb-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
            <h2 className='text-xl font-semibold text-white'>
              Loading data, please wait...
            </h2>
            <p className='text-gray-400 mt-2'>This may take a moment.</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-[#151c2b] p-6 text-white'>
      <Header title='Forecast Graph' />

      {isDialogOpen ? (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-[#1f2937] p-6 rounded-lg shadow-lg max-w-md w-full'>
            <h2 className='text-xl font-bold mb-4 flex items-center'>
              <Calendar className='mr-2' /> Enter Forecast Parameters
            </h2>
            <p className='mb-4 text-gray-300'>
              Please provide the forecast period and products to analyze.
            </p>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                type='text'
                value={forecastPeriod}
                onChange={(e) => setForecastPeriod(e.target.value)}
                placeholder='Forecast Period (e.g., 1 month)'
                className='w-full p-2 border border-gray-600 rounded bg-[#374151] text-white'
              />
              <input
                type='text'
                value={productsInput}
                onChange={(e) => setProductsInput(e.target.value)}
                placeholder='Products (comma-separated)'
                className='w-full p-2 border border-gray-600 rounded bg-[#374151] text-white'
              />
              <button
                type='submit'
                className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 flex items-center justify-center'
              >
                <PlusCircle className='mr-2' /> Submit
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {error && <p className='text-red-500 mb-4'>{error}</p>}

          <div className='bg-[#1f2937] p-6 rounded-lg shadow-lg mb-6'>
            <ResponsiveContainer width='100%' height={500}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                <XAxis
                  dataKey='ds'
                  stroke='#9CA3AF'
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis stroke='#9CA3AF' tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    borderRadius: '5px',
                    border: '1px solid #4B5563',
                  }}
                />
                <Legend />
                {products.map((product, index) => (
                  <Line
                    key={product}
                    type='monotone'
                    dataKey={product}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
            {products.map((product, index) => (
              <div
                key={product}
                className='bg-[#1f2937] p-4 rounded-lg shadow-lg'
              >
                <h3
                  className='text-xl font-bold mb-2'
                  style={{ color: colors[index % colors.length] }}
                >
                  {product}
                </h3>
                <p className='text-2xl font-semibold'>
                  Total: {productTotals[product] || '0.00'}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsDialogOpen(true)}
            className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 flex items-center'
          >
            <Calendar className='mr-2' /> Change Parameters
          </button>
        </>
      )}
    </div>
  )
}

export default ForecastGraph
