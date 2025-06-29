import axios from 'axios'
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
import Header from '../components/common/Header'

import { motion } from 'framer-motion'
// import './Chart.css'
import CategoryDistributionChart from '../components/CustomerCategoryData.jsx'
import ItemPairChart from '../components/ItemPairChart.jsx'
import ProductFrequency from '../components/ProductFrequency.jsx'
import SeasonTop from '../components/SeasonTop'
import TotalSales from '../components/TotalSales.jsx'
const Chart = () => {
  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <div>
        <SeasonTop />
        <ProductFrequency />
        <CategoryDistributionChart />
        <TotalSales />
        <ItemPairChart />
      </div>
    </div>
  )
}

export default Chart
