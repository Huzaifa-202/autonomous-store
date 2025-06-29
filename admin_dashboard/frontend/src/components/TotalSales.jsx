import axios from 'axios'
import { motion } from 'framer-motion'
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

const TotalSales = () => {
  const [monthlySalesData, setMonthlySalesData] = useState([])
  const [TotalSales, setTotalSales] = useState(0)
  const [availableYears, setAvailableYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/api/transactions')
      const transactions = response.data

      const years = [
        ...new Set(transactions.map((t) => new Date(t.Date).getFullYear())),
      ].sort()
      setAvailableYears(years)

      if (years.length > 0) {
        setSelectedYear(years[years.length - 1]) // Default to the latest year
      }

      processData(transactions)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const processData = (transactions) => {
    const monthlyData = {}
    let total = 0

    transactions.forEach((transaction) => {
      const date = new Date(transaction.Date)
      const yearMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      if (!monthlyData[yearMonth]) {
        monthlyData[yearMonth] = { TotalSales: 0 }
      }

      monthlyData[yearMonth].TotalSales += transaction.Total_Cost
      total += transaction.Total_Cost // Accumulate total sales
    })

    const processedData = Object.entries(monthlyData)
      .map(([date, data]) => ({
        date,
        TotalSales: data.TotalSales,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    setMonthlySalesData(processedData)
    setTotalSales(total) // Set total sales
  }

  const filterData = () => {
    return monthlySalesData.filter((item) => {
      const [year] = item.date.split('-')
      return year === selectedYear // Filter by selected year
    })
  }

  return (
    <div className='p-4'>
      <h1 className='text-3xl font-bold mb-4'>Monthly Sales</h1>
      <div className='mb-4'>
        <label className='mr-2'>Select Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <h2 className='text-xl mb-2'>Total Sales: ${TotalSales.toFixed(2)}</h2>
      <motion.div
        className=' p-4 rounded-lg shadow'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width='100%' height={400}>
          <LineChart
            data={filterData()}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              angle={-45}
              textAnchor='end'
              height={60}
              interval={0}
            />
            <YAxis
              label={{
                value: 'Total Sales',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip />
            <Line
              type='monotone'
              dataKey='TotalSales'
              stroke='#2c3e50'
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default TotalSales
