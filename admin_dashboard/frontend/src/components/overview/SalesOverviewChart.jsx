import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  DollarSign,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const shimmer = {
  hidden: {
    opacity: 0.3,
  },
  visible: {
    opacity: 0.7,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1,
      ease: 'easeInOut',
    },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

const ChartSkeleton = () => (
  <AnimatePresence mode='wait'>
    <motion.div
      className='mx-auto max-w-7xl p-4 md:p-6 lg:p-8'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <div className='overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-lg'>
        {/* Header Section Skeleton */}
        <motion.div
          className='mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3'
          variants={itemVariants}
        >
          <div className='space-y-2'>
            <motion.div
              className='h-8 w-48 bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
            />
            <motion.div
              className='h-4 w-64 bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
            />
          </div>

          <div className='flex items-center gap-4 lg:justify-center'>
            <motion.div
              className='h-10 w-32 bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
            />
          </div>

          <motion.div
            className='rounded-xl bg-gray-700/20 p-4 lg:ml-auto'
            variants={itemVariants}
          >
            <motion.div
              className='h-16 w-full bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
            />
          </motion.div>
        </motion.div>

        {/* Stats Card Skeleton */}
        <motion.div
          className='mb-6 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 p-6'
          variants={itemVariants}
        >
          <div className='flex flex-col gap-2'>
            <motion.div
              className='h-4 w-40 bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
            />
            <motion.div
              className='h-10 w-64 bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
            />
          </div>
        </motion.div>

        {/* Chart Skeleton */}
        <motion.div
          className='h-[400px] w-full rounded-xl bg-gray-800/50 p-4'
          variants={itemVariants}
        >
          <div className='h-full w-full flex flex-col gap-4'>
            <motion.div
              className='h-full w-full bg-gray-700/50 rounded'
              variants={shimmer}
              initial='hidden'
              animate='visible'
            />
            <div className='flex justify-between px-4'>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className='h-4 w-16 bg-gray-700/50 rounded'
                  variants={shimmer}
                  initial='hidden'
                  animate='visible'
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </AnimatePresence>
)

const SalesOverviewChart = ({ onTotalSalesUpdate }) => {
  const [monthlySalesData, setMonthlySalesData] = useState([])
  const [totalSales, setTotalSales] = useState(0)
  const [availableYears, setAvailableYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('2021')
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [growthRate, setGrowthRate] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8800/api/transactions')
      const transactions = response.data

      const years = [
        ...new Set(transactions.map((t) => new Date(t.Date).getFullYear())),
      ].sort()
      setAvailableYears(years)

      setAllTransactions(transactions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const processData = useCallback((transactions, year) => {
    const monthlyData = {}
    let total = 0
    let previousMonthSales = 0
    let currentMonthSales = 0

    transactions
      .filter(
        (transaction) =>
          new Date(transaction.Date).getFullYear().toString() === year
      )
      .forEach((transaction) => {
        const date = new Date(transaction.Date)
        const yearMonth = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`

        if (!monthlyData[yearMonth]) {
          monthlyData[yearMonth] = { TotalSales: 0 }
        }

        monthlyData[yearMonth].TotalSales += transaction.Total_Cost
        total += transaction.Total_Cost

        // Track last two months for growth rate
        const monthEntries = Object.entries(monthlyData)
        if (monthEntries.length >= 2) {
          previousMonthSales =
            monthEntries[monthEntries.length - 2][1].TotalSales
          currentMonthSales =
            monthEntries[monthEntries.length - 1][1].TotalSales
        }
      })

    const processedData = Object.entries(monthlyData)
      .map(([date, data]) => ({
        date,
        TotalSales: data.TotalSales,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const growth = previousMonthSales
      ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
      : 0

    setGrowthRate(growth)
    setMonthlySalesData(processedData)
    setTotalSales(total)
  }, [])

  useEffect(() => {
    if (allTransactions.length > 0) {
      processData(allTransactions, selectedYear)
    }
  }, [selectedYear, allTransactions, processData])

  useEffect(() => {
    if (onTotalSalesUpdate) {
      onTotalSalesUpdate(totalSales)
    }
  }, [totalSales, onTotalSalesUpdate])

  const formatCurrency = useMemo(
    () => (value) =>
      new Intl.NumberFormat('ur-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value),
    []
  )

  const CustomTooltip = useCallback(
    ({ active, payload, label }) => {
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
    },
    [formatCurrency]
  )

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <AnimatePresence mode='wait'>
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
                Sales Overview
              </h2>
              <p className='text-sm text-gray-400'>
                Track your monthly sales performance
              </p>
            </div>

            <div className='flex items-center gap-4 lg:justify-center'>
              <div className='flex items-center gap-3 rounded-lg bg-gray-700/30 p-2'>
                <Calendar className='h-5 w-5 text-gray-400' />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className='rounded-md bg-transparent px-2 py-1 text-gray-200 outline-none transition-shadow duration-200 ease-in-out hover:bg-gray-700/50 focus:ring-2 focus:ring-blue-500'
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year} className='bg-gray-800'>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <motion.div
              className='rounded-xl bg-gray-700/20 p-4 lg:ml-auto'
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-400'>Monthly Growth</p>
                  <div className='flex items-center gap-2'>
                    {growthRate > 0 ? (
                      <ArrowUp className='h-4 w-4 text-green-500' />
                    ) : (
                      <ArrowDown className='h-4 w-4 text-red-500' />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        growthRate > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {Math.abs(growthRate).toFixed(1)}%
                    </span>
                  </div>
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
                Total Sales for {selectedYear}
              </span>
              <div className='flex items-center gap-2'>
                <span className='text-3xl font-bold text-white'>
                  {formatCurrency(totalSales)}
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
                data={monthlySalesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id='salesGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
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
                  dataKey='TotalSales'
                  stroke='#6366F1'
                  fill='url(#salesGradient)'
                  strokeWidth={3}
                />
                <Line
                  type='monotone'
                  dataKey='TotalSales'
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
    </AnimatePresence>
  )
}

export default SalesOverviewChart
