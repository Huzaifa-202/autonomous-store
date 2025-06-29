import { createError } from '../error.js'
import LocalGuide from '../models/LocalGuide.js'

export const createLocalGuide = async (req, res, next) => {
  try {
    const newLocalGuide = await LocalGuide.create({
      ...req.body,
      author: req.user.id, // Assuming you have authentication middleware
    })

    res.status(201).json({
      status: 'success',
      data: {
        localGuide: newLocalGuide,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getLocalGuide = async (req, res, next) => {
  try {
    const localGuide = await LocalGuide.findById(req.params.id)
      .populate('businesses')
      .populate('author', 'name')

    if (!localGuide) {
      return next(createError(404, 'No local guide found with that ID'))
    }

    res.status(200).json({
      status: 'success',
      data: {
        localGuide,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateLocalGuide = async (req, res, next) => {
  try {
    const updatedLocalGuide = await LocalGuide.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updatedLocalGuide) {
      return next(createError(404, 'No local guide found with that ID'))
    }

    res.status(200).json({
      status: 'success',
      data: {
        localGuide: updatedLocalGuide,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteLocalGuide = async (req, res, next) => {
  try {
    const localGuide = await LocalGuide.findByIdAndDelete(req.params.id)

    if (!localGuide) {
      return next(createError(404, 'No local guide found with that ID'))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllLocalGuides = async (req, res, next) => {
  try {
    const localGuides = await LocalGuide.find().populate('author', 'name')

    res.status(200).json({
      status: 'success',
      results: localGuides.length,
      data: {
        localGuides,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const searchLocalGuide = async (req, res, next) => {
  try {
    const { query, tags } = req.query
    const searchCriteria = {}

    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ]
    }

    if (tags) {
      searchCriteria.tags = { $in: tags.split(',') }
    }

    const localGuides = await LocalGuide.find(searchCriteria).populate(
      'author',
      'name'
    )

    res.status(200).json({
      status: 'success',
      results: localGuides.length,
      data: {
        localGuides,
      },
    })
  } catch (error) {
    next(error)
  }
}
