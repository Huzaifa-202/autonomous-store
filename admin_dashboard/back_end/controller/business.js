import { createError } from '../error.js'
import Business from '../models/Business.js'

export const createBusiness = async (req, res, next) => {
  try {
    const newBusiness = await Business.create({
      ...req.body,
      owner: req.user.id,
    })
    res.status(201).json({
      status: 'success',
      data: {
        business: newBusiness,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
    if (!business) {
      return next(createError(404, 'No business found with that ID'))
    }
    res.status(200).json({
      status: 'success',
      data: {
        business,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
    if (!business) {
      return next(createError(404, 'No business found with that ID'))
    }

    // Check if the user is the owner or an admin
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return next(
        createError(403, 'You do not have permission to update this business')
      )
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      status: 'success',
      data: {
        business: updatedBusiness,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
    if (!business) {
      return next(createError(404, 'No business found with that ID'))
    }

    // Only admin can delete a business
    if (req.user.role !== 'Admin') {
      return next(createError(403, 'Only admins can delete businesses'))
    }

    await Business.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find()
    res.status(200).json({
      status: 'success',
      results: businesses.length,
      data: {
        businesses,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const sendDigitalFlyer = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
    if (!business) {
      return next(createError(404, 'No business found with that ID'))
    }

    // Check if the user is the owner or an admin
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return next(
        createError(
          403,
          'You do not have permission to send flyers for this business'
        )
      )
    }

    if (!business.digitalFlyer || !business.digitalFlyer.isActive) {
      return next(
        createError(
          400,
          'Digital flyer feature is not active for this business'
        )
      )
    }

    if (business.digitalFlyer.usedQuota >= business.digitalFlyer.monthlyQuota) {
      return next(createError(400, 'Monthly digital flyer quota exceeded'))
    }

    // Here you would implement the logic to send the digital flyer
    // This is a placeholder for the actual implementation
    console.log('Sending digital flyer for business:', business.name)

    business.digitalFlyer.usedQuota += 1
    business.digitalFlyer.lastSentDate = Date.now()
    await business.save()

    res.status(200).json({
      status: 'success',
      message: 'Digital flyer sent successfully',
    })
  } catch (error) {
    next(error)
  }
}
