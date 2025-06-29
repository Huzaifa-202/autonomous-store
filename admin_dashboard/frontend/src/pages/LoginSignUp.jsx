import axios from 'axios'
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../config'
import { loginFailure, loginStart, loginSuccess } from '../redux/userSlice'

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [redirect, setRedirect] = useState(false)
  const [userType, setUserType] = useState('staff') // New state for user type
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(loginStart())
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!isLogin && password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const endpoint = isLogin
        ? 'http://localhost:5500/api/auth/login'
        : 'http://localhost:5500/api/auth/register'

      const payload = isLogin
        ? { email, password }
        : { username, email, password, userType } // Include userType in payload

      const response = await axios.post(endpoint, payload)

      if (isLogin) {
        setSuccess('Logged in successfully!')
        dispatch(loginSuccess(response.data))

        localStorage.setItem('token', response.data.token)
        if (response.data.userType === 'admin') {
          navigate('/dashboard')
        }
        if (response.data.userType === 'staff') {
          navigate('/restock-dashboard')
        }
        setRedirect(true)
      } else {
        setSuccess('Account created successfully! Please log in.')
        setIsLogin(true)
        setUsername('')
        setPassword('')
        setConfirmPassword('')
        setAgreeTerms(false)
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      dispatch(loginFailure(errorMessage))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <div
        style={{
          backgroundColor: '#0A0A2E',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cpolygon fill='%235056cc' points='957 450 539 900 1396 900'/%3E%3Cpolygon fill='%23453caa' points='957 450 872.9 900 1396 900'/%3E%3Cpolygon fill='%23494ec5' points='-60 900 398 662 816 900'/%3E%3Cpolygon fill='%233e34a3' points='337 900 398 662 816 900'/%3E%3Cpolygon fill='%234246be' points='1203 546 1552 900 876 900'/%3E%3Cpolygon fill='%23362d9c' points='1203 546 1552 900 1162 900'/%3E%3Cpolygon fill='%233b3eb8' points='641 695 886 900 367 900'/%3E%3Cpolygon fill='%232f2596' points='587 900 641 695 886 900'/%3E%3Cpolygon fill='%233336b1' points='1710 900 1401 632 1096 900'/%3E%3Cpolygon fill='%23261d8f' points='1710 900 1401 632 1365 900'/%3E%3Cpolygon fill='%232b2eaa' points='1210 900 971 687 725 900'/%3E%3Cpolygon fill='%231d1588' points='943 900 1210 900 971 687'/%3E%3C/svg%3E")`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
        }}
        className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8'
      >
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <h2 className='mt-6 text-3xl font-extrabold text-white'>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>
          <div className='mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-700'>
            {error && (
              <div
                className='mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800'
                role='alert'
              >
                <div className='flex items-center'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  <span>{error}</span>
                </div>
              </div>
            )}
            {success && (
              <div
                className='mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800'
                role='alert'
              >
                <span>{success}</span>
              </div>
            )}
            <form className='space-y-6' onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label htmlFor='name' className='sr-only'>
                    Full Name
                  </label>
                  <div className='relative'>
                    <User
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                      size={18}
                    />
                    <input
                      id='name'
                      name='name'
                      type='text'
                      required
                      className='appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700 transition duration-150 ease-in-out'
                      placeholder='Full Name'
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor='email-address' className='sr-only'>
                  Email address
                </label>
                <div className='relative'>
                  <Mail
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={18}
                  />
                  <input
                    id='email-address'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    className='appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700 transition duration-150 ease-in-out'
                    placeholder='Email address'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor='password' className='sr-only'>
                  Password
                </label>
                <div className='relative'>
                  <Lock
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={18}
                  />
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    className='appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700 transition duration-150 ease-in-out'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor='confirm-password' className='sr-only'>
                      Confirm Password
                    </label>
                    <div className='relative'>
                      <Lock
                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                        size={18}
                      />
                      <input
                        id='confirm-password'
                        name='confirm-password'
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='new-password'
                        required
                        className='appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700 transition duration-150 ease-in-out'
                        placeholder='Confirm Password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor='userType' className='sr-only'>
                      User Type
                    </label>
                    <div className='relative'>
                      <select
                        id='userType'
                        name='userType'
                        className='appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700 transition duration-150 ease-in-out'
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                      >
                        <option value='staff'>Staff</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {!isLogin && (
                <div className='flex items-center'>
                  <input
                    id='agree-terms'
                    name='agree-terms'
                    type='checkbox'
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label
                    htmlFor='agree-terms'
                    className='ml-2 block text-sm text-gray-200'
                  >
                    I agree to the{' '}
                    <a href='#' className='text-blue-500 hover:text-blue-400'>
                      terms and conditions
                    </a>
                  </label>
                </div>
              )}
              <div>
                <button
                  type='submit'
                  disabled={loading}
                  className={`w-full py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <Loader className='mx-auto animate-spin' size={18} />
                  ) : isLogin ? (
                    <div className='flex items-center justify-center'>
                      <LogIn size={18} className='mr-2' />
                      Sign in
                    </div>
                  ) : (
                    <div className='flex items-center justify-center'>
                      <UserPlus size={18} className='mr-2' />
                      Sign up
                    </div>
                  )}
                </button>
              </div>
            </form>
            <div className='text-center mt-6'>
              <button
                onClick={toggleForm}
                className='text-white hover:text-blue-200 text-sm font-medium focus:outline-none'
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup
