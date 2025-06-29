import mongoose from 'mongoose'

const AirbnbSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listingUrl: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    pricePerNight: {
      type: Number,
      required: true,
    },
    location: {
      city: String,
      country: String,
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    image: String, // URL to main image
  },
  { timestamps: true }
)

AirbnbSchema.index({ 'location.coordinates': '2dsphere' })

export default mongoose.model('Airbnb', AirbnbSchema)
