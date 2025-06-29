import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Cloud, CloudSnow, Leaf, Loader2, Sun } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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

const SeasonTop = () => {
  const [chartData, setChartData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const seasonIcons = {
    Winter: CloudSnow,
    Spring: Leaf,
    Summer: Sun,
    Fall: Cloud,
  }

  const seasons = ['Winter', 'Spring', 'Summer', 'Fall']

  // Clean product name by removing brackets and quotes
  const cleanProductName = (name) => {
    return name.replace(/[\[\]']/g, '')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8800/api/transactions'
        )
        const transactions = response.data

        const productsBySeason = {
          Winter: {},
          Spring: {},
          Summer: {},
          Fall: {},
        }

        transactions.forEach((transaction) => {
          const { Season, Product } = transaction
          Product.forEach((product) => {
            const cleanName = cleanProductName(product)
            if (!productsBySeason[Season][cleanName]) {
              productsBySeason[Season][cleanName] = 0
            }
            productsBySeason[Season][cleanName]++
          })
        })

        const processedData = {}
        Object.keys(productsBySeason).forEach((season) => {
          const sortedProducts = Object.entries(productsBySeason[season])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }))
          processedData[season] = sortedProducts
        })

        setChartData(processedData)
      } catch (error) {
        setError('Error fetching data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartColors = {
    Winter: '#60A5FA',
    Spring: '#34D399',
    Summer: '#FBBF24',
    Fall: '#FB923C',
  }

  const gradientColors = {
    Winter: ['#60A5FA20', '#60A5FA10'],
    Spring: ['#34D39920', '#34D39910'],
    Summer: ['#FBBF2420', '#FBBF2410'],
    Fall: ['#FB923C20', '#FB923C10'],
  }

  const SkeletonLoader = () => (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
      {seasons.map((season, index) => (
        <motion.div
          key={season}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className='relative p-4 md:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl'
        >
          <div className='flex items-center gap-3 mb-4'>
            <motion.div
              className='w-9 h-9 rounded-lg bg-gray-700'
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
              className='h-6 w-24 rounded-md bg-gray-700'
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

          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className='flex items-center gap-4'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  className='h-8 w-32 rounded-md bg-gray-700'
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                />
                <motion.div
                  className='h-8 flex-1 rounded-md bg-gray-700'
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className='p-4 md:p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <motion.div
            className='h-8 w-64 rounded-md bg-gray-700'
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
            className='h-6 w-48 rounded-md bg-gray-700'
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
        <SkeletonLoader />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error}
      </motion.div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg'>
          <p className='text-gray-300 font-medium'>{label}</p>
          <p className='text-gray-200 font-bold'>Sales: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className='p-4 md:p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-2xl font-bold text-gray-100'>
          Seasonal Product Performance
        </h1>
        <div className='text-sm text-gray-400'>Top 5 products per season</div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        <AnimatePresence>
          {Object.entries(chartData).map(([season, data], index) => {
            const SeasonIcon = seasonIcons[season]
            return (
              <motion.div
                key={season}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className='relative p-4 md:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl'
              >
                <div
                  className='absolute inset-0 rounded-xl opacity-50'
                  style={{
                    background: `linear-gradient(135deg, ${gradientColors[season][0]} 0%, ${gradientColors[season][1]} 100%)`,
                  }}
                />

                <div className='relative'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div
                      className='p-2 rounded-lg'
                      style={{ backgroundColor: `${chartColors[season]}20` }}
                    >
                      <SeasonIcon
                        className='w-5 h-5'
                        style={{ color: chartColors[season] }}
                      />
                    </div>
                    <h2 className='text-lg md:text-xl font-semibold text-gray-100'>
                      {season}
                    </h2>
                  </div>

                  <div className='h-[300px] md:h-[350px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 70 }}
                        layout='vertical'
                      >
                        <CartesianGrid
                          strokeDasharray='3 3'
                          stroke='#374151'
                          opacity={0.5}
                        />
                        <XAxis
                          type='number'
                          stroke='#9CA3AF'
                          tick={{ fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis
                          type='category'
                          dataKey='name'
                          stroke='#9CA3AF'
                          tick={{ fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#4B5563' }}
                          width={150}
                          interval={0}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey='value'
                          fill={chartColors[season]}
                          radius={[0, 4, 4, 0]}
                        >
                          {data.map((entry, index) => (
                            <motion.rect
                              key={`bar-${index}`}
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SeasonTop
