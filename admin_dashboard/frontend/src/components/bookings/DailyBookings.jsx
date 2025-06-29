import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, DollarSign, TrendingUp } from 'lucide-react'
import React, { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DailyBookings = () => {
  const dailySalesData = [
    { date: '07/01', amount: 145 },
    { date: '07/02', amount: 152 },
    { date: '07/03', amount: 149 },
    { date: '07/04', amount: 160 },
    { date: '07/05', amount: 155 },
    { date: '07/06', amount: 158 },
    { date: '07/07', amount: 162 },
  ]

  const stats = useMemo(() => {
    const total = dailySalesData.reduce((sum, day) => sum + day.amount, 0)
    const avg = total / dailySalesData.length
    const lastDayGrowth =
      ((dailySalesData[dailySalesData.length - 1].amount -
        dailySalesData[dailySalesData.length - 2].amount) /
        dailySalesData[dailySalesData.length - 2].amount) *
      100

    return {
      total,
      avg,
      growth: lastDayGrowth,
    }
  }, [dailySalesData])

  const formatCurrency = (value) => {
    return `PKR ${value.toLocaleString()}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='rounded-lg bg-gray-800 p-4 shadow-lg ring-1 ring-gray-700'>
          <p className='mb-2 text-sm text-gray-400'>{label}</p>
          <p className='text-lg font-semibold text-white'>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      className='mx-auto max-w-7xl p-4 md:p-6 lg:p-8'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className='overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-lg'>
        {/* Header Section */}
        <div className='mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='space-y-2'>
            <h2 className='flex items-center gap-2 text-2xl font-semibold text-white'>
              <TrendingUp className='h-6 w-6 text-blue-500' />
              Daily Sales
            </h2>
            <p className='text-sm text-gray-400'>
              Track your daily sales performance
            </p>
          </div>

          <div className='lg:flex lg:justify-center'>
            <motion.div
              className='rounded-xl bg-gray-700/20 p-4'
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-400'>Daily Growth</p>
                  <div className='flex items-center gap-2'>
                    {stats.growth > 0 ? (
                      <ArrowUp className='h-4 w-4 text-green-500' />
                    ) : (
                      <ArrowDown className='h-4 w-4 text-red-500' />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        stats.growth > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {Math.abs(stats.growth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className='rounded-xl bg-gray-700/20 p-4 lg:ml-auto'
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className='space-y-1'>
              <p className='text-sm text-gray-400'>Average Daily Sales</p>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-gray-400' />
                <span className='text-lg font-bold text-white'>
                  {formatCurrency(stats.avg)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Card */}
        <motion.div
          className='mb-6 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 p-6'
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-400'>
              Total Sales (Last 7 Days)
            </span>
            <div className='flex items-center gap-2'>
              <span className='text-3xl font-bold text-white'>
                {formatCurrency(stats.total)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          className='h-[400px] w-full rounded-xl bg-gray-800/50 p-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ResponsiveContainer>
            <LineChart
              data={dailySalesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id='salesGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#6366F1' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#6366F1' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#374151'
                opacity={0.5}
              />
              <XAxis
                dataKey='date'
                stroke='#9CA3AF'
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
              />
              <YAxis
                stroke='#9CA3AF'
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={CustomTooltip} />
              <Area
                type='monotone'
                dataKey='amount'
                stroke='#6366F1'
                fill='url(#salesGradient)'
                strokeWidth={0}
              />
              <Line
                type='monotone'
                dataKey='amount'
                stroke='#6366F1'
                strokeWidth={3}
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DailyBookings
