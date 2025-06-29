import express from 'express'
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getUserProfile,
  signin,
  signup,
  updateUser,
} from '../controller/auth.js'
import { restrictTo, verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/signup', signup)
router.post('/signin', signin)

// Protected routes
router.use(verifyToken)

router.get('/profile/:id', getUserProfile)
router.put('/update/:id', updateUser)
router.put('/change-password', changePassword)

// Admin only routes
router.use(restrictTo('admin'))

router.get('/all-users', getAllUsers)
router.delete('/delete/:id', deleteUser)

export default router
