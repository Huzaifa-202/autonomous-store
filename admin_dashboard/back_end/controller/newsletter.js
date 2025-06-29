import { createError } from '../error.js'
import Newsletter from '../models/Newsletter.js'

export const subscribe = async (req, res, next) => {
  try {
    const { email, name, country, city, subscriptions, subscriptionType } =
      req.body

    const newSubscription = await Newsletter.create({
      email,
      name,
      country,
      city,
      subscriptions,
      subscriptionType,
    })

    res.status(201).json({
      status: 'success',
      data: {
        subscription: newSubscription,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const unsubscribe = async (req, res, next) => {
  try {
    const { email, subscriptionId } = req.body

    const subscription = await Newsletter.findOne({ email })

    if (!subscription) {
      return next(createError(404, 'No subscription found with that email'))
    }

    if (subscriptionId) {
      subscription.subscriptions = subscription.subscriptions.filter(
        (sub) => sub.toString() !== subscriptionId
      )
    } else {
      subscription.isSubscribedToMain = false
    }

    await subscription.save()

    res.status(200).json({
      status: 'success',
      message: 'Unsubscribed successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const updatePreferences = async (req, res, next) => {
  try {
    const { email, preferences } = req.body

    const updatedSubscription = await Newsletter.findOneAndUpdate(
      { email },
      { preferences },
      { new: true, runValidators: true }
    )

    if (!updatedSubscription) {
      return next(createError(404, 'No subscription found with that email'))
    }

    res.status(200).json({
      status: 'success',
      data: {
        subscription: updatedSubscription,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find()

    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: {
        subscribers,
      },
    })
  } catch (error) {
    next(error)
  }
}
