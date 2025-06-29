import { AlertCircle, MessageSquare, ThumbsUp, Zap } from 'lucide-react'
import React from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Header from '../components/common/Header'
import { useFeedback } from '../hooks/useFeedback'

const FeedbackDashboard = () => {
  const { feedback, stats, loading, error } = useFeedback()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4'>
        <AlertCircle className='w-12 h-12 text-red-500 mb-4' />
        <h2 className='text-xl font-semibold text-slate-200 mb-2'>
          Error Loading Feedback
        </h2>
        <p className='text-slate-300 text-center'>{error}</p>
      </div>
    )
  }

  // Calculate averages from all feedback entries
  const calculateAverages = () => {
    if (!feedback || feedback.length === 0) return defaultStats.averageRatings

    const sum = feedback.reduce(
      (acc, curr) => ({
        easeofuse: acc.easeofuse + Number(curr.easeOfUse?.rating || 0),
        featureeffectiveness:
          acc.featureeffectiveness +
          Number(curr.featureEffectiveness?.rating || 0),
        overallexperience:
          acc.overallexperience + Number(curr.overallExperience?.rating || 0),
      }),
      {
        easeofuse: 0,
        featureeffectiveness: 0,
        overallexperience: 0,
      }
    )

    return {
      easeofuse: Number((sum.easeofuse / feedback.length).toFixed(1)),
      featureeffectiveness: Number(
        (sum.featureeffectiveness / feedback.length).toFixed(1)
      ),
      overallexperience: Number(
        (sum.overallexperience / feedback.length).toFixed(1)
      ),
    }
  }

  // Get the latest non-zero ratings
  const getLatestValidFeedback = () => {
    if (!feedback || feedback.length === 0) return null

    // Find the first feedback entry with non-zero ratings
    return (
      feedback.find(
        (entry) =>
          Number(entry.easeOfUse?.rating) > 0 ||
          Number(entry.featureEffectiveness?.rating) > 0 ||
          Number(entry.overallExperience?.rating) > 0
      ) || feedback[0]
    )
  }

  const defaultRating = { rating: 0, ratingLabel: 'No Rating' }
  const defaultStats = {
    totalResponses: 0,
    averageRatings: {
      easeofuse: 0,
      featureeffectiveness: 0,
      overallexperience: 0,
    },
  }

  const latestFeedback = getLatestValidFeedback() || {
    additionalFeedback: '',
    createdAt: 'No feedback available',
    easeOfUse: defaultRating,
    featureEffectiveness: defaultRating,
    overallExperience: defaultRating,
  }

  const averageRatings = calculateAverages()
  const safeStats = {
    ...(stats || defaultStats),
    averageRatings,
  }

  const chartData = [
    {
      name: 'Ease of Use',
      value: Number(latestFeedback.easeOfUse?.rating || 0),
      average: averageRatings.easeofuse,
    },
    {
      name: 'Feature Effectiveness',
      value: Number(latestFeedback.featureEffectiveness?.rating || 0),
      average: averageRatings.featureeffectiveness,
    },
    {
      name: 'Overall Experience',
      value: Number(latestFeedback.overallExperience?.rating || 0),
      average: averageRatings.overallexperience,
    },
  ]

  const calculateCombinedAverage = () => {
    const averages = [
      averageRatings.easeofuse,
      averageRatings.featureeffectiveness,
      averageRatings.overallexperience,
    ]
    const combinedAverage =
      averages.reduce((a, b) => a + b, 0) / averages.length
    return Number(combinedAverage).toFixed(1)
  }

  const getRatingColor = (rating) => {
    const ratingNum = Number(rating)
    switch (Math.round(ratingNum)) {
      case 1:
        return '#ef4444'
      case 2:
        return '#f97316'
      case 3:
        return '#eab308'
      case 4:
        return '#14b8a6'
      case 5:
        return '#0d9488'
      default:
        return '#94a3b8'
    }
  }

  const getAverageRating = (key) => {
    const value = safeStats.averageRatings?.[key] ?? 0
    return Number(value).toFixed(1)
  }

  const getRatingLabel = (rating) => {
    const ratingNum = Number(rating)
    switch (ratingNum) {
      case 1:
        return 'Very Dissatisfied'
      case 2:
        return 'Dissatisfied'
      case 3:
        return 'Neutral'
      case 4:
        return 'Satisfied'
      case 5:
        return 'Very Satisfied'
      default:
        return 'No Rating'
    }
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Invalid date'

      // If it's already a formatted string from Firestore service, return it
      if (typeof dateString === 'string' && dateString.includes(',')) {
        return dateString
      }

      const date = new Date(dateString)
      return date instanceof Date && !isNaN(date)
        ? date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Invalid date'
    } catch (err) {
      console.error('Date formatting error:', err)
      return 'Invalid date'
    }
  }

  const combinedAverage = calculateCombinedAverage()

  return (
    <div className='flex-1 overflow-auto relative z-10 p-6 text-white'>
      {/* Header with Stats */}
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-200'>
          Feedback Analytics
        </h1>
        <p className='text-slate-300'>
          Latest Feedback: {formatDate(latestFeedback.createdAt)}
        </p>
        <div className='mt-4 text-sm text-slate-400'>
          Total Responses: {feedback?.length || 0} | Combined Average Rating:{' '}
          {combinedAverage}/5
        </div>
      </div>

      {/* Rating Chart */}
      <div className='p-6 rounded-2xl bg-slate-800/50 border border-slate-700 shadow-2xl mb-6'>
        <h2 className='text-2xl font-semibold mb-4 text-slate-200'>
          Performance Metrics
        </h2>
        <div className='h-64 w-full'>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey='name' stroke='#94a3b8' />
              <YAxis domain={[0, 5]} stroke='#94a3b8' />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Bar
                dataKey='value'
                name='Current Rating'
                fill='url(#gradientFill)'
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='average'
                name='Average Rating'
                fill='#475569'
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id='gradientFill' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#14b8a6' />
                  <stop offset='100%' stopColor='#0d9488' />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feedback Table */}
      <div className='p-6 rounded-2xl bg-slate-800/50 border border-slate-700 shadow-2xl mb-6 overflow-x-auto'>
        <h2 className='text-2xl font-semibold mb-4 text-slate-200'>
          Feedback History
        </h2>
        <table className='w-full min-w-[800px]'>
          <thead>
            <tr className='border-b border-slate-700'>
              <th className='text-left p-3 text-slate-300'>Date</th>
              <th className='text-left p-3 text-slate-300'>Ease of Use</th>
              <th className='text-left p-3 text-slate-300'>
                Feature Effectiveness
              </th>
              <th className='text-left p-3 text-slate-300'>
                Overall Experience
              </th>
              <th className='text-left p-3 text-slate-300'>
                Additional Feedback
              </th>
            </tr>
          </thead>
          <tbody>
            {feedback?.map((item, index) => (
              <tr key={index} className='border-b border-slate-700/50'>
                <td className='p-3 text-slate-300'>
                  {formatDate(item.createdAt)}
                </td>
                <td className='p-3'>
                  <span
                    className='font-medium'
                    style={{ color: getRatingColor(item.easeOfUse?.rating) }}
                  >
                    {Number(item.easeOfUse?.rating || 0)}/5
                  </span>
                </td>
                <td className='p-3'>
                  <span
                    className='font-medium'
                    style={{
                      color: getRatingColor(item.featureEffectiveness?.rating),
                    }}
                  >
                    {Number(item.featureEffectiveness?.rating || 0)}/5
                  </span>
                </td>
                <td className='p-3'>
                  <span
                    className='font-medium'
                    style={{
                      color: getRatingColor(item.overallExperience?.rating),
                    }}
                  >
                    {Number(item.overallExperience?.rating || 0)}/5
                  </span>
                </td>
                <td className='p-3 text-slate-300'>
                  {item.additionalFeedback || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Ratings */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {[
          {
            icon: ThumbsUp,
            title: 'Ease of Use',
            key: 'easeofuse',
            data: latestFeedback.easeOfUse,
          },
          {
            icon: Zap,
            title: 'Feature Effectiveness',
            key: 'featureeffectiveness',
            data: latestFeedback.featureEffectiveness,
          },
          {
            icon: MessageSquare,
            title: 'Overall Experience',
            key: 'overallexperience',
            data: latestFeedback.overallExperience,
          },
        ].map((item) => (
          <div
            key={item.title}
            className='p-6 rounded-2xl bg-slate-800/50 border border-slate-700 shadow-xl'
          >
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600'>
                <item.icon className='h-5 w-5 text-white' />
              </div>
              <h3 className='text-xl font-semibold text-slate-200'>
                {item.title}
              </h3>
            </div>
            <div className='flex flex-col items-center'>
              <div className='text-5xl font-bold mb-2 flex items-baseline'>
                <span style={{ color: getRatingColor(item.data?.rating) }}>
                  {Number(item.data?.rating || 0)}
                </span>
                <span className='text-2xl text-slate-500 ml-1'>/5</span>
              </div>
              <p className='text-slate-300 text-center font-medium'>
                {getRatingLabel(item.data?.rating)}
              </p>
              <p className='text-sm text-slate-400 mt-2'>
                Average: {getAverageRating(item.key)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeedbackDashboard
