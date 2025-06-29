import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'framer-motion'

// Updated data reflecting customer footfall during different times of the day for each day of the week
const customerActivityData = [
  {
    name: 'Mon',
    '0-4': 10,
    '4-8': 20,
    '8-12': 150,
    '12-16': 250,
    '16-20': 300,
    '20-24': 180,
  },
  {
    name: 'Tue',
    '0-4': 15,
    '4-8': 25,
    '8-12': 160,
    '12-16': 260,
    '16-20': 320,
    '20-24': 190,
  },
  {
    name: 'Wed',
    '0-4': 18,
    '4-8': 28,
    '8-12': 170,
    '12-16': 270,
    '16-20': 350,
    '20-24': 200,
  },
  {
    name: 'Thu',
    '0-4': 20,
    '4-8': 30,
    '8-12': 180,
    '12-16': 280,
    '16-20': 360,
    '20-24': 210,
  },
  {
    name: 'Fri',
    '0-4': 25,
    '4-8': 35,
    '8-12': 190,
    '12-16': 290,
    '16-20': 380,
    '20-24': 220,
  },
  {
    name: 'Sat',
    '0-4': 30,
    '4-8': 40,
    '8-12': 200,
    '12-16': 300,
    '16-20': 400,
    '20-24': 230,
  },
  {
    name: 'Sun',
    '0-4': 12,
    '4-8': 22,
    '8-12': 140,
    '12-16': 240,
    '16-20': 280,
    '20-24': 170,
  },
]

const UserActivityHeatmap = () => {
  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-4'>
        Customer Activity Heatmap
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={customerActivityData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
            <XAxis dataKey='name' stroke='#9CA3AF' />
            <YAxis stroke='#9CA3AF' />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend />
            <Bar dataKey='0-4' stackId='a' fill='#6366F1' />
            <Bar dataKey='4-8' stackId='a' fill='#8B5CF6' />
            <Bar dataKey='8-12' stackId='a' fill='#EC4899' />
            <Bar dataKey='12-16' stackId='a' fill='#10B981' />
            <Bar dataKey='16-20' stackId='a' fill='#F59E0B' />
            <Bar dataKey='20-24' stackId='a' fill='#3B82F6' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default UserActivityHeatmap
