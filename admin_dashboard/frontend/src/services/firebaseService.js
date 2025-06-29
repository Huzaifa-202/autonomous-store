// src/services/firebaseService.js
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export const fetchFeedback = async () => {
  try {
    const feedbackCollection = collection(db, 'app_feedback')
    const feedbackQuery = query(
      feedbackCollection,
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(feedbackQuery)

    const feedbackData = querySnapshot.docs.map((doc) => {
      const data = doc.data()

      // Convert Firestore Timestamp to formatted date string
      const createdAt = data.createdAt?.toDate?.()
        ? data.createdAt.toDate().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
          })
        : 'Date not available'

      // Map the Firebase field names to the dashboard's expected structure
      return {
        id: doc.id,
        createdAt,
        additionalFeedback: data.additionalFeedback || '',
        easeOfUse: {
          rating: data.checkoutEfficiency?.rating || 0,
          ratingLabel: getRatingLabel(data.checkoutEfficiency?.rating),
        },
        featureEffectiveness: {
          rating: data.productFinding?.rating || 0,
          ratingLabel: getRatingLabel(data.productFinding?.rating),
        },
        overallExperience: {
          rating: data.shoppingExperience?.rating || 0,
          ratingLabel: getRatingLabel(data.shoppingExperience?.rating),
        },
        userEmail: data.userEmail,
        userId: data.userId,
        userName: data.userName,
      }
    })

    return feedbackData
  } catch (error) {
    console.error('Error fetching feedback:', error)
    throw error
  }
}

// Helper function to get rating labels
const getRatingLabel = (rating) => {
  switch (rating) {
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

// Fetch feedback for a specific date range
export const fetchFeedbackByDateRange = async (startDate, endDate) => {
  try {
    const feedbackCollection = collection(db, 'app_feedback')
    const feedbackQuery = query(
      feedbackCollection,
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(feedbackQuery)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...formatFeedbackData(doc.data(), doc.id),
    }))
  } catch (error) {
    console.error('Error fetching feedback by date range:', error)
    throw error
  }
}

// Get feedback statistics
export const getFeedbackStats = (feedbackData) => {
  const stats = {
    totalResponses: feedbackData.length,
    averageRatings: {
      easeOfUse: 0,
      featureEffectiveness: 0,
      overallExperience: 0,
    },
    ratingDistribution: {
      easeOfUse: Array(5).fill(0),
      featureEffectiveness: Array(5).fill(0),
      overallExperience: Array(5).fill(0),
    },
  }

  feedbackData.forEach((feedback) => {
    // Calculate averages
    stats.averageRatings.easeOfUse += feedback.easeOfUse.rating
    stats.averageRatings.featureEffectiveness +=
      feedback.featureEffectiveness.rating
    stats.averageRatings.overallExperience += feedback.overallExperience.rating

    // Calculate distribution
    if (feedback.easeOfUse.rating > 0) {
      stats.ratingDistribution.easeOfUse[feedback.easeOfUse.rating - 1]++
    }
    if (feedback.featureEffectiveness.rating > 0) {
      stats.ratingDistribution.featureEffectiveness[
        feedback.featureEffectiveness.rating - 1
      ]++
    }
    if (feedback.overallExperience.rating > 0) {
      stats.ratingDistribution.overallExperience[
        feedback.overallExperience.rating - 1
      ]++
    }
  })

  // Calculate final averages
  if (feedbackData.length > 0) {
    stats.averageRatings.easeOfUse = Number(
      (stats.averageRatings.easeOfUse / feedbackData.length).toFixed(1)
    )
    stats.averageRatings.featureEffectiveness = Number(
      (stats.averageRatings.featureEffectiveness / feedbackData.length).toFixed(
        1
      )
    )
    stats.averageRatings.overallExperience = Number(
      (stats.averageRatings.overallExperience / feedbackData.length).toFixed(1)
    )
  }

  return stats
}

// Helper function to format feedback data
const formatFeedbackData = (data, id) => {
  const createdAt = data.createdAt?.toDate?.()
    ? data.createdAt.toDate().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
      })
    : 'Date not available'

  return {
    id,
    createdAt,
    additionalFeedback: data.additionalFeedback || '',
    easeOfUse: {
      rating: data.checkoutEfficiency?.rating || 0,
      ratingLabel: getRatingLabel(data.checkoutEfficiency?.rating),
    },
    featureEffectiveness: {
      rating: data.productFinding?.rating || 0,
      ratingLabel: getRatingLabel(data.productFinding?.rating),
    },
    overallExperience: {
      rating: data.shoppingExperience?.rating || 0,
      ratingLabel: getRatingLabel(data.shoppingExperience?.rating),
    },
    userEmail: data.userEmail,
    userId: data.userId,
    userName: data.userName,
  }
}
