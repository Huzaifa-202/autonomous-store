import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Updated data for customer behavior analysis
const behaviorData = [
  { name: 'High Traffic Areas', value: 3500 },
  { name: 'Moderate Traffic Areas', value: 2500 },
  { name: 'Low Traffic Areas', value: 1500 },
  { name: 'Checkout Zones', value: 2000 },
  { name: 'Promotional Displays', value: 1800 },
]

// Updated color scheme for customer behavior
const COLORS = ['#4F46E5', '#9333EA', '#F472B6', '#22C55E', '#F59E0B']

const CategoryDistributionChart = () => {
  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>
        Customer Behavior Analysis
      </h2>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={behaviorData}
              cx='50%'
              cy='50%'
              labelLine={false}
              outerRadius={80}
              dataKey='value'
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {behaviorData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default CategoryDistributionChart
