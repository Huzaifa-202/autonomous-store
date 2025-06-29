import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, User, Lock, Key, EyeOff, Eye, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../config'
const LoginSignupPage = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [userType, setUserType] = useState('staff')

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const account = {
      username: 'test1',
      password: 'test',
      email: 'test@gmail.com',
    }

    axiosInstance.post('auth/register', account)
    onLogin(username, password)
    if (userType === 'staff') {
      navigate('/restock-dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const account = {
      username: 'test1',
      password: 'test',
      email: 'test@gmail.com',
    }

    axiosInstance.post('auth/login', account)
    onLogin(username, password)
    if (userType === 'staff') {
      navigate('/restock-dashboard')
    } else {
      navigate('/dashboard')
    }
  }
  const handleForgotPassword = (e) => {
    e.preventDefault()
    // Here you would typically handle sending a password reset email
    console.log(`Sending password reset email to: ${email}`)
    alert(`Password reset email sent to ${email}`)
  }

  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const formVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  const TermsAndService = () => (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold text-purple-300 mb-4'>
          Terms and Service
        </h2>
        <p className='text-gray-300 mb-4'>
          Welcome to Autonomous Store. By using our services, you agree to these
          terms. Please read them carefully.
        </p>
        <h3 className='text-xl font-semibold text-purple-300 mb-2'>
          1. Use of Service
        </h3>
        <p className='text-gray-300 mb-4'>
          You must follow any policies made available to you within the
          Services. Don't misuse our Services.
        </p>
        <h3 className='text-xl font-semibold text-purple-300 mb-2'>
          2. Privacy
        </h3>
        <p className='text-gray-300 mb-4'>
          Our privacy policies explain how we treat your personal data and
          protect your privacy when you use our Services.
        </p>
        <h3 className='text-xl font-semibold text-purple-300 mb-2'>
          3. Modifications
        </h3>
        <p className='text-gray-300 mb-4'>
          We may modify these terms or any additional terms that apply to a
          Service to reflect changes to the law or changes to our Services.
        </p>
        <button
          className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          onClick={() => setShowTerms(false)}
        >
          Close
        </button>
      </div>
    </div>
  )

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-10'
      style={{
        backgroundImage:
          "url('https://www.grocerydive.com/imgproxy/1PAYJxXxF06Obx7z7IAG_ZuvE8s6PQiXY_3f8_qmoUM/g:ce/rs:fill:1200:675:1/bG9jYWw6Ly8vZGl2ZWltYWdlL0FpRmlfQWxiZXJ0X0hlaWpuLmpwZw==.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <motion.div
        className='bg-gray-800 rounded-lg overflow-hidden max-w-md w-full'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        style={{
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className='p-8'>
          <div className='text-center mb-8'>
            <motion.div
              className='inline-block'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart className='w-16 h-16 text-purple-400 mx-auto' />
            </motion.div>
            <h2 className='mt-4 text-3xl font-bold text-purple-300'>
              Autonomous Store
            </h2>
            <p className='text-gray-400'>Experience the future of shopping</p>
          </div>

          {!showForgotPassword ? (
            <motion.div
              variants={formVariants}
              initial='hidden'
              animate='visible'
              key={isLogin ? 'login' : 'signup'}
            >
              <form onSubmit={handleSubmit}>
                <div className='mb-4'>
                  <label className='block text-purple-300 text-sm font-bold mb-2'>
                    Continue as:
                  </label>
                  <div className='flex justify-between'>
                    <button
                      type='button'
                      className={`w-1/2 py-2 px-4 rounded-l ${
                        userType === 'staff'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                      onClick={() => setUserType('staff')}
                    >
                      Staff
                    </button>
                    <button
                      type='button'
                      className={`w-1/2 py-2 px-4 rounded-r ${
                        userType === 'admin'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                      onClick={() => setUserType('admin')}
                    >
                      Admin
                    </button>
                  </div>
                </div>
                <div className='mb-4'>
                  <label
                    className='block text-purple-300 text-sm font-bold mb-2'
                    htmlFor='username'
                  >
                    Username
                  </label>
                  <div className='relative'>
                    <input
                      className='appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      id='username'
                      type='text'
                      placeholder='Enter your username'
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <User className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                  </div>
                </div>
                <div className='mb-6'>
                  <label
                    className='block text-purple-300 text-sm font-bold mb-2'
                    htmlFor='password'
                  >
                    Password
                  </label>
                  <div className='relative'>
                    <input
                      className='appearance-none border rounded w-full py-2 px-3 pl-10 pr-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                    <button
                      type='button'
                      className='absolute right-3 top-2.5 text-gray-400'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5' />
                      ) : (
                        <Eye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>
                {!isLogin && (
                  <div className='mb-6'>
                    <label
                      className='block text-purple-300 text-sm font-bold mb-2'
                      htmlFor='secret-key'
                    >
                      Secret Key
                    </label>
                    <div className='relative'>
                      <input
                        className='appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        id='secret-key'
                        type='password'
                        placeholder='Enter your secret key'
                      />
                      <Key className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                    </div>
                  </div>
                )}
                <div className='mb-6 flex items-center'>
                  <input type='checkbox' id='remember-me' className='mr-2' />
                  <label
                    htmlFor='remember-me'
                    className='text-sm text-gray-400'
                  >
                    Remember me
                  </label>
                </div>
                <motion.button
                  className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type='submit'
                >
                  {isLogin ? 'Log In' : 'Sign Up'}
                </motion.button>
              </form>
              <div className='mt-4 text-center'>
                <motion.button
                  className='text-sm text-purple-400 hover:text-purple-300'
                  onClick={() => setShowForgotPassword(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot Password?
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={formVariants}
              initial='hidden'
              animate='visible'
              key='forgot-password'
            >
              <form onSubmit={handleForgotPassword}>
                <div className='mb-4'>
                  <label
                    className='block text-purple-300 text-sm font-bold mb-2'
                    htmlFor='email'
                  >
                    Email
                  </label>
                  <div className='relative'>
                    <input
                      className='appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-300 bg-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                      id='email'
                      type='email'
                      placeholder='Enter your email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                  </div>
                </div>
                <motion.button
                  className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type='submit'
                >
                  Reset Password
                </motion.button>
              </form>
              <div className='mt-4 text-center'>
                <motion.button
                  className='text-sm text-purple-400 hover:text-purple-300'
                  onClick={() => setShowForgotPassword(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Login
                </motion.button>
              </div>
            </motion.div>
          )}

          {!showForgotPassword && (
            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-400'>
                {isLogin
                  ? "Don't have an account?"
                  : 'Already have an account?'}
                <motion.button
                  className='ml-1 text-purple-400 hover:text-purple-300 font-semibold'
                  onClick={() => setIsLogin(!isLogin)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </motion.button>
              </p>
            </div>
          )}
        </div>

        <motion.div
          className='bg-gray-900 p-4 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className='text-xs text-gray-400'>
            By using this service, you agree to our{' '}
            <button
              className='text-purple-400 hover:text-purple-300'
              onClick={() => setShowTerms(true)}
            >
              Privacy Policy and Terms of Service
            </button>
            .
          </p>
        </motion.div>
      </motion.div>
      {showTerms && <TermsAndService />}
    </div>
  )
}

export default LoginSignupPage
