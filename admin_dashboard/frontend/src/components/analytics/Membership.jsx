import { motion } from 'framer-motion'
import { AlertCircle, Check } from 'lucide-react'
import { useState } from 'react'

// Mock data for membership plans - replace with actual data
const membershipPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    features: ['50 flyers per month', 'Basic Membership', 'Email support'],
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 19.99,
    features: [
      '200 flyers per month',
      'Advanced Membership',
      'Priority email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 49.99,
    features: [
      '500 flyers per month',
      'Premium Membership',
      '24/7 phone support',
      'Custom branding',
    ],
  },
]

// Mock function to handle subscription changes - replace with actual implementation
const changeSubscription = async (planId) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true, message: `Successfully changed to ${planId} plan!` }
}

const Membership = ({ currentPlan = 'free' }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const handlePlanChange = async (planId) => {
    if (planId === currentPlan) return

    setIsProcessing(true)
    setResult(null)

    try {
      const response = await changeSubscription(planId)
      setResult({ type: 'success', message: response.message })
      setSelectedPlan(planId)
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to change plan. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 max-w-4xl mx-auto my-7'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-2xl font-semibold text-gray-100 mb-6'>
        Membership Plans
      </h2>

      <div className='grid md:grid-cols-3 gap-6 mb-6 '>
        {membershipPlans.map((plan) => (
          <motion.div
            key={plan.id}
            className={`bg-gray-700 rounded-lg p-6 flex flex-col ${
              selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h3 className='text-xl font-semibold text-gray-100 mb-2'>
              {plan.name}
            </h3>
            <p className='text-3xl font-bold text-gray-100 mb-4'>
              ${plan.price}
              <span className='text-sm font-normal'>/month</span>
            </p>
            <ul className='flex-grow mb-4'>
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className='flex items-center text-gray-300 mb-2'
                >
                  <Check className='w-5 h-5 mr-2 text-green-500' />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanChange(plan.id)}
              disabled={isProcessing || selectedPlan === plan.id}
              className={`w-full py-2 px-4 rounded font-semibold ${
                selectedPlan === plan.id
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {selectedPlan === plan.id ? 'Current Plan' : 'Select Plan'}
            </button>
          </motion.div>
        ))}
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 rounded-lg ${
            result.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } flex items-start`}
        >
          {result.type === 'success' ? (
            <Check className='w-5 h-5 mr-2 mt-0.5' />
          ) : (
            <AlertCircle className='w-5 h-5 mr-2 mt-0.5' />
          )}
          <p>{result.message}</p>
        </motion.div>
      )}

      <p className='text-gray-400 mt-6 text-sm'>
        Note: Downgrading your plan may result in the loss of some features.
        Please review the plan details carefully before making changes.
      </p>
    </motion.div>
  )
}

export default Membership
