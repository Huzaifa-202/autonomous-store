import mongoose from 'mongoose'

const BusinessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Store', 'Restaurant', 'Point of Interest'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    contactEmail: {
      type: String,
      required: true,
    },
    phoneNumber: String,
    websiteUrl: String,
    googleMapsUrl: String,
    googleReviewsUrl: String,
    images: [
      {
        type: String, // URL to image
      },
    ],
    menu: {
      type: String, // URL to menu PDF
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    minimumReviewFilter: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    subscriberCount: {
      type: Number,
      default: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    openingHours: [
      {
        day: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
        open: String,
        close: String,
      },
    ],
    digitalFlyer: {
      isActive: {
        type: Boolean,
        default: false,
      },
      subscriberCount: {
        type: Number,
        default: 0,
      },
      monthlyQuota: {
        type: Number,
        default: 50,
      },
      usedQuota: {
        type: Number,
        default: 0,
      },
      lastSentDate: Date,
    },
    reviewSystem: {
      isActive: {
        type: Boolean,
        default: false,
      },
      monthlyQuota: {
        type: Number,
        default: 50,
      },
      usedQuota: {
        type: Number,
        default: 0,
      },
      minimumRating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5,
      },
    },
  },
  { timestamps: true }
)

BusinessSchema.index({ location: '2dsphere' })

export default mongoose.model('Business', BusinessSchema)
