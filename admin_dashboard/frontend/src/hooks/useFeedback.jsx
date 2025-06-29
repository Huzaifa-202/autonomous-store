// src/hooks/useFeedback.js
import { useState, useEffect } from 'react'
import {
  fetchFeedback,
  fetchFeedbackByDateRange,
  getFeedbackStats,
} from '../services/firebaseService'

export const useFeedback = (dateRange = null) => {
  const [feedback, setFeedback] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true)
        let data

        if (dateRange) {
          data = await fetchFeedbackByDateRange(dateRange.start, dateRange.end)
        } else {
          data = await fetchFeedback()
        }

        setFeedback(data)
        setStats(getFeedbackStats(data))
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error loading feedback:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [dateRange])

  return { feedback, stats, loading, error }
}
