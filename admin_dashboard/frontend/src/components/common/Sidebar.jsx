import { AnimatePresence, motion } from 'framer-motion'
import {
  Antenna,
  BarChart2,
  Building2,
  ChartBar,
  ChevronLeft,
  ChevronRight,
  HandHelping,
  LogOut,
  Menu,
  PanelsTopLeft,
  Settings,
  Shield,
  SquareMenu,
  UserRoundCheck,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../redux/userSlice'

// You can replace this with your actual logo URL
const LOGO_URL = '/api/placeholder/40/40'

const SIDEBAR_ITEMS = [
  {
    category: 'Analytics',
    items: [
      {
        name: 'Sales Dashboard',
        icon: BarChart2,
        color: '#6366f1',
        href: '/dashboard',
      },
      {
        name: 'Customer Analytics',
        icon: UserRoundCheck,
        color: '#EC4899',
        href: '/users',
      },
      {
        name: 'Product Stats',
        icon: ChartBar,
        color: '#F59E0B',
        href: '/Bookings',
      },
    ],
  },
  {
    category: 'Predictions',
    items: [
      {
        name: 'Sales Prediction',
        icon: PanelsTopLeft,
        color: '#f07407',
        href: '/prediction',
      },
      {
        name: 'Product Prediction',
        icon: Building2,
        color: '#f07407',
        href: '/product-prediction',
      },
    ],
  },
  {
    category: 'Management',
    items: [
      // {
      //   name: 'Stock Management',
      //   icon: SquareMenu,
      //   color: '#10B981',
      //   href: '/stock',
      // },

      {
        name: 'Security',
        icon: Shield,
        color: '#f07407',
        href: '/security',
      },
      {
        name: 'Planogram',
        icon: HandHelping,
        color: '#76f333',
        href: '/planogram',
      },
    ],
  },
  {
    category: 'User',
    items: [
      {
        name: 'User Feedback',
        icon: BarChart2,
        color: '#6366f1',
        href: '/feedback',
      },
      {
        name: 'Profile',
        icon: Settings,
        color: '#6EE7B7',
        href: '/settings',
      },
      {
        name: 'Logout',
        icon: LogOut,
        color: '#EF4444',
        href: '/',
      },
    ],
  },
]

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      setIsSidebarOpen(!isMobileView)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const sidebarVariants = {
    open: {
      width: '256px',
      transition: { duration: 0.3 },
    },
    closed: {
      width: '80px',
      transition: { duration: 0.3 },
    },
  }

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href

    return (
      <motion.div
        className={`flex items-center p-3 text-sm font-medium rounded-lg transition-colors mb-1
          ${
            isActive
              ? 'bg-gray-700 text-white'
              : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={item.name === 'Logout' ? handleLogout : undefined}
      >
        {item.name !== 'Logout' ? (
          <Link to={item.href} className='flex items-center w-full'>
            <item.icon size={18} style={{ color: item.color }} />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  className='ml-3 whitespace-nowrap'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ) : (
          <div className='flex items-center w-full cursor-pointer'>
            <item.icon size={18} style={{ color: item.color }} />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  className='ml-3 whitespace-nowrap'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <>
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <motion.div
        className={`fixed md:relative h-screen z-30 ${
          isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        initial={false}
      >
        <div className='h-full bg-gray-800 bg-opacity-95 backdrop-blur-lg shadow-xl flex flex-col border-r border-gray-700 overflow-hidden'>
          <div className='flex items-center justify-between p-4 border-b border-gray-700'>
            <div className='flex items-center'>
              {/* Company name or app name */}
              {isSidebarOpen && (
                <motion.span
                  className='text-white font-semibold ml-2'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Dashboard
                </motion.span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className='p-2 rounded-full hover:bg-gray-700 transition-colors'
            >
              {isSidebarOpen ? (
                <ChevronLeft size={20} className='text-gray-400' />
              ) : (
                <ChevronRight size={20} className='text-gray-400' />
              )}
            </motion.button>
          </div>

          <div className='flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'>
            {SIDEBAR_ITEMS.map((category, index) => (
              <div key={index} className='px-3 py-2'>
                {isSidebarOpen && (
                  <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3'>
                    {category.category}
                  </h3>
                )}
                {category.items.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
                {index < SIDEBAR_ITEMS.length - 1 && isSidebarOpen && (
                  <div className='h-px bg-gray-700 my-2 mx-3' />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar
