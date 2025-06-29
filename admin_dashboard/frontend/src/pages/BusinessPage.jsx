import { motion } from 'framer-motion'

import Header from '../components/common/Header'
import StatCard from '../components/common/StatCard'

import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react'
import BusinessExplorer from '../components/business/BusinessExplorer'
import BusinessTable from '../components/business/BusinessTable'
import SalesTrendChart from '../components/business/SalesTrendChart'
import CategoryDistributionChart from '../components/overview/CategoryDistributionChart'
import ProductFrequency from '../components/ProductFrequency.jsx'
const ProductsPage = () => {
  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Business Metrics' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name='Total Listings'
            icon={Package}
            value={924}
            color='#6366F1'
          />
          <StatCard
            name='Top Selling Product'
            icon={TrendingUp}
            value={89}
            color='#10B981'
          />
          <StatCard
            name='Incomplete Listings'
            icon={AlertTriangle}
            value={23}
            color='#F59E0B'
          />
          <StatCard
            name='Total Revenue'
            icon={DollarSign}
            value={'$543,210'}
            color='#EF4444'
          />
        </motion.div>

        <BusinessTable />
        <BusinessExplorer userLocation='Canada' />

        {/* CHARTS */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <SalesTrendChart />
          <CategoryDistributionChart />
          <ProductFrequency />
        </div>
      </main>
    </div>
  )
}
export default ProductsPage
