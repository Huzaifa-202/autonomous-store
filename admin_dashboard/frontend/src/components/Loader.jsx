import { motion } from 'framer-motion'
import { ShoppingBag, Store } from 'lucide-react'
import React from 'react'

const Loader = () => {
  const iconVariants = {
    rotate: {
      rotate: 360,
      transition: {
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  const bagVariants = {
    bounce: {
      y: [-8, 0, -8],
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  const textVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  const progressVariants = {
    initial: { scaleX: 0 },
    animate: {
      scaleX: 1,
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  const glowVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md'>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className='flex flex-col items-center gap-8 p-10 rounded-3xl bg-gray-900/90 border border-gray-700/30 shadow-2xl'
      >
        <div className='relative'>
          <motion.div
            variants={glowVariants}
            animate='animate'
            className='absolute inset-0 -z-10'
          >
            <div className='w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl' />
          </motion.div>

          <motion.div
            variants={iconVariants}
            animate='rotate'
            className='relative'
          >
            <Store className='w-20 h-20 text-blue-400' />
          </motion.div>

          <motion.div
            variants={bagVariants}
            animate='bounce'
            className='absolute -top-3 -right-3'
          >
            <ShoppingBag className='w-8 h-8 text-purple-400' />
          </motion.div>

          <motion.div
            variants={bagVariants}
            animate='bounce'
            transition={{ delay: 0.2 }}
            className='absolute -bottom-3 -left-3'
          >
            <ShoppingBag className='w-8 h-8 text-cyan-400' />
          </motion.div>
        </div>

        <div className='flex flex-col items-center gap-3'>
          <motion.h2
            variants={textVariants}
            animate='animate'
            className='text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent'
          >
            Loading Store
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className='text-sm text-gray-400'
          >
            Preparing your autonomous shopping experience...
          </motion.p>
        </div>

        <div className='relative w-64 h-2 bg-gray-800 rounded-full overflow-hidden'>
          <motion.div
            variants={progressVariants}
            initial='initial'
            animate='animate'
            className='absolute inset-0 origin-left bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500'
          />
        </div>
      </motion.div>
    </div>
  )
}

export default Loader
