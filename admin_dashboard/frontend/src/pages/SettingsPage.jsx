import { motion } from 'framer-motion'
import React from 'react'
import Header from '../components/common/Header'

const SettingsPage = () => {
  const currentUser = {
    name: 'Maqbool Ahmed',
    email: 'maqbooldot78@example.com',
    phone: '+92 (302) 10767880',
    avatar:
      'https://i.fbcd.co/products/resized/resized-750-500/d4c961732ba6ec52c0bbde63c9cb9e5dd6593826ee788080599f68920224e27d.jpg',
  }

  return (
    <div className='flex-1 overflow-auto relative z-10 '>
      <div className='min-h-[calc(100vh-64px)] flex items-center justify-center p-4'>
        <motion.div
          className='bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        >
          <div className='relative'>
            <motion.div
              className='w-32 h-32 mx-auto relative'
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div
                className='absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-xl'
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.img
                src={currentUser.avatar}
                alt={currentUser.name}
                className='w-full h-full rounded-full object-cover border-4 border-gray-700 shadow-lg relative z-10'
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          </div>

          <motion.div
            className='text-center mt-6 space-y-4'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h1 className='text-2xl font-bold text-white'>
              {currentUser.name}
            </h1>

            <div className='space-y-2 text-gray-400'>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {currentUser.email}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {currentUser.phone}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage
