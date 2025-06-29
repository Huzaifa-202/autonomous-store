import axios from 'axios'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const COLORS = ['#60A5FA', '#4ADE80', '#FBBF24', '#F472B6', '#8B5CF6']

const CategoryDistributionChart = () => {
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8800/api/transactions'
        )
        const transactions = response.data

        // Count occurrences of each Customer_Category
        const categoryCounts = transactions.reduce((acc, transaction) => {
          const category = transaction.Customer_Category
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})

        // Transform the data into the format required by the pie chart
        const formattedData = Object.entries(categoryCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        )

        setCategoryData(formattedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div> // Loading state can be improved with a spinner or placeholder
  }

  return (
    <div>
      <h2 className='text-lg font-medium mb-4 text-gray-800'>
        Customer Category Distribution
      </h2>
      <motion.div
        className=' shadow-lg rounded-xl p-6 border border-gray-300'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={categoryData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                dataKey='value'
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  borderColor: '#D1D5DB',
                }}
                itemStyle={{ color: '#1F2937' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

export default CategoryDistributionChart
