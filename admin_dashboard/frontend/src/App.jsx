import React from 'react'
import { useSelector } from 'react-redux'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import EditBusiness from './components/business/EditBusiness'
import Sidebar from './components/common/Sidebar'
import Loader from './components/Loader'
import RestockingDashboard from './components/restock/RestockingDashboard'
import AdminNotificationPage from './pages/AdminNotificationPage'
import BookingsPage from './pages/BookingsPage'
import BusinessPage from './pages/BusinessPage'
import CCTVDashboard from './pages/CCTVDashboard'
import Chart from './pages/Charts'
import FeedbackList from './pages/FeedbackList'
import FlyerPage from './pages/FlyerPage'
import HeatmapViewer from './pages/Hetamap'
import LandingPage from './pages/LandingPage'
import LiveFeed from './pages/LiveFeed'
import LocalGuidePage from './pages/LocalGuidePage'
import LoginSignup from './pages/LoginSignUp'
import MembershipPage from './pages/MembershipPage'
import MyFeed from './pages/MyFeedPage'
import MyRentalsPage from './pages/MyRentalsPage'
import NotificationListener from './pages/NotificationListener'
import OverviewPage from './pages/OverviewPage'
import ProductPrediciton from './pages/ProductPrediciton'
import RetailStore from './pages/RetailStore'
import RetailStorePlanner from './pages/RetailStorePlanner'
import SalesPrediction from './pages/SalesPrediction'
import Security from './pages/Security'
import SettingsPage from './pages/SettingsPage'
import ShortTermRentals from './pages/ShortTermRentalsPage'
import SubscribedFlyers from './pages/SubscribedFlyersPage'
import SubscribersPage from './pages/SubscribersPage'
import UserList from './pages/UserList'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useSelector((state) => state.user)

  // List of routes where Sidebar and background should not be shown
  const routesWithoutSidebarAndBg = ['/', '/login', '/restock-dashboard']

  // Check if the current route should show sidebar and background
  const showSidebarAndBackground = !routesWithoutSidebarAndBg.includes(
    location.pathname
  )

  // Protected route component
  const ProtectedRoute = ({ children, allowedUserType }) => {
    if (!currentUser || currentUser.userType !== allowedUserType) {
      return <Navigate to='/login' replace />
    }
    return children
  }

  return (
    <>
      {/* NotificationListener placed here for global notifications */}
      <NotificationListener />

      <div
        className={`${
          location.pathname === '/'
            ? 'w-full h-full'
            : 'flex h-screen bg-gray-900 text-gray-100 overflow-hidden'
        }`}
      >
        {showSidebarAndBackground && location.pathname !== '/' && (
          <>
            {/* BG */}
            <div className='fixed inset-0 z-0'>
              <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
              <div className='absolute inset-0 backdrop-blur-sm' />
            </div>
            <Sidebar />
          </>
        )}

        <div
          className={`${
            location.pathname === '/' ? 'w-full h-full' : 'flex-1 overflow-auto'
          } ${
            showSidebarAndBackground && location.pathname !== '/' ? 'ml-20' : ''
          }`}
        >
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<LoginSignup />} />

            {/* Conditional routing based on user type */}
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute allowedUserType='admin'>
                  <OverviewPage />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path='/restock-dashboard'
              element={
                <ProtectedRoute allowedUserType='staff'>
                  <RestockingDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Other routes */}
            <Route path='/business' element={<BusinessPage />} />
            <Route path='/edit-business/:id' element={<EditBusiness />} />
            <Route path='/users' element={<SubscribersPage />} />
            <Route path='/heat' element={<HeatmapViewer />} />
            <Route path='/myfeed' element={<MyFeed />} />
            <Route path='/sales' element={<FlyerPage />} />
            <Route path='/short-term-rentals' element={<ShortTermRentals />} />
            <Route path='/local-guide' element={<LocalGuidePage />} />
            <Route path='/Bookings' element={<BookingsPage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/cctv' element={<CCTVDashboard />} />
            <Route path='/planogram' element={<RetailStore />} />
            <Route path='/live' element={<LiveFeed />} />
            <Route path='/security' element={<Security />} />
            <Route path='/notifi' element={<NotificationListener />} />
            <Route path='/user-data' element={<UserList />} />
            <Route path='/charts' element={<Chart />} />
            <Route path='/loader' element={<Loader />} />
            <Route
              path='/notifications/:id'
              element={<AdminNotificationPage />}
            />
            <Route path='/prediction' element={<SalesPrediction />} />
            <Route path='/product-prediction' element={<ProductPrediciton />} />
            <Route
              path='/restock-dashboard'
              element={<RestockingDashboard />}
            />
            <Route path='/feedback' element={<FeedbackList />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
