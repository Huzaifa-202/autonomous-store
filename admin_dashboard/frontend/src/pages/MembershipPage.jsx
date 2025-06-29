import Header from '../components/common/Header'

import AIPoweredInsights from '../components/analytics/AIPoweredInsights'
import ChannelPerformance from '../components/analytics/ChannelPerformance'
import CustomerSegmentation from '../components/analytics/CustomerSegmentation'
import Membership from '../components/analytics/Membership'
import OverviewCards from '../components/analytics/OverviewCards'
import ProductPerformance from '../components/analytics/ProductPerformance'
import RevenueChart from '../components/analytics/RevenueChart'
import UserRetention from '../components/analytics/UserRetention'

const MembershipPage = () => {
  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title={'Membership'} />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <Membership currentPlan='basic' />
        {/* <OverviewCards />
        <RevenueChart /> */}

        {/* <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <ChannelPerformance />
          <ProductPerformance />
          <UserRetention />
          <CustomerSegmentation />
        </div> */}

        <AIPoweredInsights />
      </main>
    </div>
  )
}
export default MembershipPage
