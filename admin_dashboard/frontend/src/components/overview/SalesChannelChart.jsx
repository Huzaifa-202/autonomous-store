import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = {
  primary: '#3538ec',
  secondary: '#0d3b4f',
  accent1: '#063718',
  accent2: '#9e1f61',
  accent3: '#af7209',
}

const SalesChannelChart = () => {
  const [pairData, setPairData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hoveredBar, setHoveredBar] = useState(null)

  const SkeletonLoader = () => (
    <motion.div
      className='backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-800'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='space-y-3'>
          <motion.div
            className='h-6 w-64 bg-gray-800 rounded-lg'
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
            className='h-4 w-48 bg-gray-800 rounded-lg'
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
      </div>

      <div className='h-[400px] relative'>
        {/* Y-axis skeleton */}
        <motion.div
          className='absolute left-0 top-0 bottom-16 w-12 flex flex-col justify-between py-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className='h-4 w-8 bg-gray-800 rounded'
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>

        {/* Bars skeleton */}
        <div className='absolute inset-0 flex items-end justify-around pb-16 px-16'>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className='w-12 bg-gray-800 rounded-t-lg'
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 60 + 20}%` }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            >
              <motion.div
                className='absolute -bottom-16 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-800 rounded'
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Grid lines skeleton */}
        <div className='absolute inset-0 flex flex-col justify-between py-8'>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className='w-full h-px bg-gray-800'
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8800/api/transactions'
        )
        const transactions = response.data
        processTransactionData(transactions)
      } catch (err) {
        setError('Failed to fetch data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processTransactionData = (transactions) => {
    const pairCount = {}
    let totalPairs = 0

    transactions.forEach((transaction) => {
      const productString = transaction.Product[0]
      const cleanedProducts = productString.replace(/[\[\]']/g, '').split(', ')

      if (!cleanedProducts || !Array.isArray(cleanedProducts)) return

      for (let i = 0; i < cleanedProducts.length - 1; i++) {
        const pair = [cleanedProducts[i], cleanedProducts[i + 1]]
          .sort()
          .join(' + ')
        pairCount[pair] = (pairCount[pair] || 0) + 1
        totalPairs++
      }
    })

    const pairArray = Object.entries(pairCount)
      .map(([pair, count]) => ({
        name: pair,
        value: count,
        percentage: ((count / totalPairs) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    setPairData(pairArray)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='p-4 rounded-lg shadow-xl border'>
          <p className='text-gray-200 font-semibold mb-2'>
            Product Combination
          </p>
          <div className='flex items-center gap-2 text-gray-300'>
            <Package className='w-4 h-4' />
            <span className='font-medium'>{data.name}</span>
          </div>
          <div className='mt-2 space-y-1'>
            <div className='flex items-center gap-2 text-sky-400'>
              <ShoppingBag className='w-4 h-4' />
              <span className='font-medium'>{data.value} purchases</span>
            </div>
            <div className='flex items-center gap-2 text-indigo-400'>
              <TrendingUp className='w-4 h-4' />
              <span className='font-medium'>{data.percentage}% of total</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return <SkeletonLoader />
  }

  if (error) {
    return (
      <motion.div
        className='p-4 bg-red-900/20 border border-red-800/30 rounded-lg text-red-400'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error}
      </motion.div>
    )
  }

  return (
    <motion.div
      className='backdrop-blur-sm shadow-xl rounded-xl p-6 border-none border-gray-800'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='space-y-1.5'>
          <h2 className='text-xl font-semibold text-gray-100 tracking-tight'>
            Product Combination Analysis
          </h2>
          <p className='text-sm text-gray-400 font-medium'>
            Most frequently purchased product pairs
          </p>
        </div>
      </div>

      <div className='h-[400px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={pairData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#1F2937'
              opacity={0.5}
            />
            <XAxis
              dataKey='name'
              stroke='#6B7280'
              angle={-45}
              textAnchor='end'
              height={80}
              tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis
              stroke='#6B7280'
              tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
              tickLine={{ stroke: '#374151' }}
              label={{
                value: 'Purchase Frequency',
                angle: -90,
                position: 'insideCenter',
                fill: '#9CA3AF',
                fontSize: 13,
                fontWeight: 500,
                offset: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey='value'
              radius={[4, 4, 0, 0]}
              onMouseEnter={(data, index) => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {pairData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Object.values(COLORS)[index]}
                  opacity={
                    hoveredBar === null || hoveredBar === index ? 1 : 0.5
                  }
                  style={{
                    filter: hoveredBar === index ? 'brightness(1.2)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default SalesChannelChart
