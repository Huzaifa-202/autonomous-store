import express from 'express'
import {
  createBusiness,
  deleteBusiness,
  getAllBusinesses,
  getBusiness,
  sendDigitalFlyer,
  updateBusiness,
} from '../controller/business.js'
import { restrictTo, verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.get('/', getAllBusinesses)
router.get('/:id', getBusiness)

// Protected routes
router.use(verifyToken) // Apply authentication middleware to all routes below this line

router.post('/', restrictTo('Admin', 'Business'), createBusiness)
router.patch('/:id', restrictTo('Admin', 'Business'), updateBusiness)
router.delete('/:id', restrictTo('Admin'), deleteBusiness)
router.post(
  '/:id/send-flyer',
  restrictTo('Admin', 'Business'),
  sendDigitalFlyer
)

export default router
