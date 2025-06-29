import axios from 'axios'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const ItemPairChart = () => {
  const [pairData, setPairData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8800/api/transactions'
        )
        const transactions = response.data // Assuming response.data is an array of transaction objects
        console.log('Fetched transactions:', transactions) // Debugging: Check the structure

        // Function to count adjacent item pairs
        const countAdjacentItemPairs = () => {
          const pairCount = {}

          // Loop through all transactions
          transactions.forEach((transaction) => {
            const productString = transaction.Product[0] // Access the first (and only) element in the Product array
            const cleanedProducts = productString
              .replace(/[\[\]']/g, '') // Remove brackets and extra quotes
              .split(', ') // Split by comma and space to get individual products

            if (!cleanedProducts || !Array.isArray(cleanedProducts)) {
              console.warn('Invalid product entry:', cleanedProducts) // Catch cases where product is missing or not an array
              return
            }

            console.log('Cleaned products in transaction:', cleanedProducts)

            // Loop through each item and count pairs with the next item
            for (let i = 0; i < cleanedProducts.length - 1; i++) {
              const pair = [cleanedProducts[i], cleanedProducts[i + 1]]
                .sort()
                .join(' & ') // Create pair with next item
              pairCount[pair] = (pairCount[pair] || 0) + 1 // Count the pair
            }
          })

          console.log('Pair count object:', pairCount) // Debugging: Check if pairs are counted correctly

          // Convert pairCount object to an array of objects
          const pairArray = Object.entries(pairCount)
            .map(([pair, count]) => ({
              pair,
              count,
            }))
            .sort((a, b) => b.count - a.count) // Sort by count descending
            .slice(0, 5) // Get top 5 pairs

          // Log the top pairs to the console
          console.log('Top pairs:', pairArray)

          setPairData(pairArray)
        }

        countAdjacentItemPairs()
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className='text-gray-800'>Loading...</div>
  if (error) return <div className='text-red-500'>{error}</div>

  return (
    <motion.div
      className='bg-white shadow-lg rounded-xl p-6 border border-gray-300'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-800'>
        Frequently Bought Together
      </h2>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={pairData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='pair' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='count' fill='#60A5FA' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default ItemPairChart
