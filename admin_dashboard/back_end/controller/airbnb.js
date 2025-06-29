import { createError } from '../error.js'
import Airbnb from '../models/Airbnb.js'

export const createAirbnb = async (req, res, next) => {
  try {
    const newAirbnb = await Airbnb.create({
      ...req.body,
      owner: req.user.id, // Assuming you have authentication middleware
    })

    res.status(201).json({
      status: 'success',
      data: {
        airbnb: newAirbnb,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getAirbnb = async (req, res, next) => {
  try {
    const airbnb = await Airbnb.findById(req.params.id).populate(
      'owner',
      'name'
    )

    if (!airbnb) {
      return next(createError(404, 'No Airbnb listing found with that ID'))
    }

    res.status(200).json({
      status: 'success',
      data: {
        airbnb,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateAirbnb = async (req, res, next) => {
  try {
    const updatedAirbnb = await Airbnb.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updatedAirbnb) {
      return next(createError(404, 'No Airbnb listing found with that ID'))
    }

    res.status(200).json({
      status: 'success',
      data: {
        airbnb: updatedAirbnb,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAirbnb = async (req, res, next) => {
  try {
    const airbnb = await Airbnb.findByIdAndDelete(req.params.id)

    if (!airbnb) {
      return next(createError(404, 'No Airbnb listing found with that ID'))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllAirbnbs = async (req, res, next) => {
  try {
    const airbnbs = await Airbnb.find().populate('owner', 'name')

    res.status(200).json({
      status: 'success',
      results: airbnbs.length,
      data: {
        airbnbs,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const searchAirbnbs = async (req, res, next) => {
  try {
    const { location, minPrice, maxPrice, bedrooms } = req.query
    const searchCriteria = {}

    if (location) {
      searchCriteria['location.city'] = { $regex: location, $options: 'i' }
    }

    if (minPrice || maxPrice) {
      searchCriteria.pricePerNight = {}
      if (minPrice) searchCriteria.pricePerNight.$gte = Number(minPrice)
      if (maxPrice) searchCriteria.pricePerNight.$lte = Number(maxPrice)
    }

    if (bedrooms) {
      searchCriteria.bedrooms = Number(bedrooms)
    }

    const airbnbs = await Airbnb.find(searchCriteria).populate('owner', 'name')

    res.status(200).json({
      status: 'success',
      results: airbnbs.length,
      data: {
        airbnbs,
      },
    })
  } catch (error) {
    next(error)
  }
}
