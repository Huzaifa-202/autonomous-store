import { motion } from 'framer-motion'
import { Clock, TrendingUp, Users } from 'lucide-react'
import React from 'react'
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

const storePerformanceData = [
  { month: 'Jan', customers: 300, avgCheckoutTime: 4.0 },
  { month: 'Feb', customers: 288, avgCheckoutTime: 3.2 },
  { month: 'Mar', customers: 272, avgCheckoutTime: 3.1 },
  { month: 'Apr', customers: 308, avgCheckoutTime: 3.2 },
  { month: 'May', customers: 299, avgCheckoutTime: 3.8 },
  { month: 'Jun', customers: 285, avgCheckoutTime: 3.1 },
]

const StorePerformanceChart = () => {
  const getPercentageChange = (data, key) => {
    const firstValue = data[0][key]
    const lastValue = data[data.length - 1][key]
    return (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
  }

  return (
    <motion.div
      className='flex flex-col gap-6 p-6 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 shadow-xl'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-gray-100'>Customer Metrics</h2>
          <span className='text-sm text-gray-400'>Last 6 months</span>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center gap-3 p-4 bg-gray-700 bg-opacity-50 rounded-lg'>
            <Users className='w-5 h-5 text-emerald-400' />
            <div>
              <p className='text-sm text-gray-400'>Average Daily Customers</p>
              <p className='text-xl font-semibold text-gray-100'>300</p>
            </div>
          </div>
          <div className='flex items-center gap-3 p-4 bg-gray-700 bg-opacity-50 rounded-lg'>
            <Clock className='w-5 h-5 text-yellow-400' />
            <div>
              <p className='text-sm text-gray-400'>Average Checkout Time</p>
              <p className='text-xl font-semibold text-gray-100'>3.5 mins</p>
            </div>
          </div>
        </div>
      </div>
      <div className='h-[400px] mt-2'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={storePerformanceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#374151'
              opacity={0.5}
            />
            <XAxis
              dataKey='month'
              stroke='#9CA3AF'
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#4B5563' }}
            />
            <YAxis
              yAxisId='left'
              stroke='#9CA3AF'
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#4B5563' }}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              stroke='#9CA3AF'
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#4B5563' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                borderColor: '#4B5563',
                borderRadius: '0.5rem',
                padding: '1rem',
              }}
              itemStyle={{ color: '#E5E7EB' }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '0.5rem' }}
            />
            <Legend wrapperStyle={{ paddingTop: '1rem' }} iconType='circle' />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='customers'
              name='Daily Customers'
              stroke='#8B5CF6'
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='avgCheckoutTime'
              name='Avg Checkout Time (min)'
              stroke='#10B981'
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default StorePerformanceChart
