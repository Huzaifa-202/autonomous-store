import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Filter, RefreshCw, TrendingUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const ProductFrequency = () => {
  const [chartData, setChartData] = useState([])
  const [startYear, setStartYear] = useState('')
  const [startMonth, setStartMonth] = useState('')
  const [endYear, setEndYear] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [availableYears, setAvailableYears] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:8800/api/transactions')
      const transactions = response.data

      const years = [
        ...new Set(transactions.map((t) => new Date(t.Date).getFullYear())),
      ].sort()
      setAvailableYears(years)

      if (years.length > 0) {
        setStartYear(years[0])
        setEndYear(years[years.length - 1])
        setStartMonth('01')
        setEndMonth('12')
      }

      processData(transactions)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const SkeletonLoader = () => (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div className='space-y-2'>
          <motion.div
            className='h-8 w-48 bg-gray-700 rounded-lg'
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className='h-4 w-64 bg-gray-700 rounded-lg'
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
          />
        </div>
        <motion.div
          className='h-10 w-32 bg-gray-700 rounded-lg'
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl space-y-6'
      >
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              className='space-y-2'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className='h-5 w-24 bg-gray-700 rounded-lg'
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.2,
                }}
              />
              <motion.div
                className='h-10 w-full bg-gray-700 rounded-lg'
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.2,
                }}
              />
            </motion.div>
          ))}
        </div>

        <div className='h-[400px] md:h-[500px] relative'>
          <motion.div
            className='absolute inset-0 bg-gray-700 rounded-lg'
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className='absolute inset-0 flex items-center justify-center'>
            <motion.div
              className='w-16 h-1 bg-gray-600 rounded-full'
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )

  const processData = (transactions) => {
    const monthlyData = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.Date)
      const yearMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      if (!monthlyData[yearMonth]) {
        monthlyData[yearMonth] = { totalItems: 0, count: 0 }
      }

      monthlyData[yearMonth].totalItems += transaction.Total_Items
      monthlyData[yearMonth].count += 1
    })

    const processedData = Object.entries(monthlyData)
      .map(([date, data]) => ({
        date,
        averageItems: Math.round(data.totalItems / data.count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    setChartData(processedData)
  }

  const filterData = () => {
    return chartData.filter((item) => {
      const [year, month] = item.date.split('-').map(Number)
      const startYearNum = parseInt(startYear, 10)
      const endYearNum = parseInt(endYear, 10)
      const startMonthNum = parseInt(startMonth, 10)
      const endMonthNum = parseInt(endMonth, 10)

      const isAfterStart =
        year > startYearNum || (year === startYearNum && month >= startMonthNum)
      const isBeforeEnd =
        year < endYearNum || (year === endYearNum && month <= endMonthNum)

      return isAfterStart && isBeforeEnd
    })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700'>
          <p className='font-medium text-gray-300 mb-1'>{label}</p>
          <div className='flex items-center gap-2 text-blue-400'>
            <TrendingUp className='w-4 h-4' />
            <p className='font-bold'>{payload[0].value} items</p>
          </div>
        </div>
      )
    }
    return null
  }

  const SelectField = ({ label, value, onChange, options, icon: Icon }) => (
    <div className='flex flex-col gap-2'>
      <label className='text-sm font-medium text-gray-400 flex items-center gap-2'>
        <Icon className='w-4 h-4' />
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className='bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 min-w-[140px] transition-colors hover:border-gray-500'
      >
        {options}
      </select>
    </div>
  )

  if (loading) {
    return <SkeletonLoader />
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl md:text-3xl font-bold text-white'>
            Average Basket Size
          </h1>
          <p className='text-gray-400'>
            Track average items per purchase over time
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          className='flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors'
        >
          <RefreshCw className='w-4 h-4' />
          Refresh Data
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl space-y-6'
      >
        <div className='flex flex-col md:flex-row gap-4 items-start md:items-end'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow'>
            <SelectField
              label='Start Year'
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              options={availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
              icon={Calendar}
            />
            <SelectField
              label='Start Month'
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              options={[...Array(12).keys()].map((i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
              icon={Calendar}
            />
            <SelectField
              label='End Year'
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              options={availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
              icon={Calendar}
            />
            <SelectField
              label='End Month'
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              options={[...Array(12).keys()].map((i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
              icon={Calendar}
            />
          </div>
        </div>

        <div className='h-[400px] md:h-[500px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={filterData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#374151'
                opacity={0.5}
              />
              <XAxis
                dataKey='date'
                angle={-45}
                textAnchor='end'
                height={80}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#4B5563' }}
              />
              <YAxis
                label={{
                  value: 'Average Items per Purchase',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#9CA3AF',
                  offset: 10,
                }}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#4B5563' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type='monotone'
                dataKey='averageItems'
                stroke='#60A5FA'
                strokeWidth={3}
                dot={{
                  stroke: '#60A5FA',
                  strokeWidth: 2,
                  fill: '#1F2937',
                  r: 4,
                }}
                activeDot={{
                  r: 8,
                  fill: '#60A5FA',
                  stroke: '#1F2937',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

export default ProductFrequency
