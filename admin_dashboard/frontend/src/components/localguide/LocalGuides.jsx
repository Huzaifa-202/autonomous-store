import { motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Search,
} from 'lucide-react'
import { useEffect, useState } from 'react'

// Mock data - replace with actual API calls
const fetchGuides = async (location, tags) => {
  // Simulating API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    {
      id: 1,
      title: 'Taco Tour of Mexico City',
      location: 'Mexico City, Mexico',
      tags: ['tacos', 'food', 'tour'],
      description: 'Explore the best taco spots in Mexico City',
      imageUrl:
        'https://cf.bstatic.com/xdata/images/hotel/max1024x768/233023054.jpg?k=36050c5f66416f73ab352552325f804673624fc59d2c2bbb5df7b342eec8395e&o=&hp=1',
    },
    {
      id: 2,
      title: 'Tokyo Ramen Adventure',
      location: 'Tokyo, Japan',
      tags: ['ramen', 'food', 'nightlife'],
      description: 'Discover hidden ramen gems in Tokyo',
      imageUrl:
        'https://manage.isleblue.co/uploads/villas/images/99/st-martin-les-palmiers-2024-header2_medium.jpg',
    },
    {
      id: 3,
      title: 'Paris Art Walk',
      location: 'Paris, France',
      tags: ['art', 'museum', 'walking'],
      description: "A curated walk through Paris' best art spots",
      imageUrl:
        'https://i.lmpm.com/img/lmpm-company-store-prod/64760d663a928/properties/02f9810b-827d-4b72-9abc-e4e269727dac/mountainsideretreat(74).jpg?w=2048&h=1152&q=60',
    },
    {
      id: 4,
      title: 'New York Pizza Crawl',
      location: 'New York, USA',
      tags: ['pizza', 'food', 'urban'],
      description: 'Try the best slices NYC has to offer',
      imageUrl:
        'https://cdn.decoist.com/wp-content/uploads/2015/10/Scenic-landscape-surrounds-the-beautiful-lakeside-getaway.jpg',
    },
    {
      id: 5,
      title: 'Bangkok Street Food Tour',
      location: 'Bangkok, Thailand',
      tags: ['street food', 'market', 'local'],
      description: 'Taste authentic Thai street food',
      imageUrl:
        'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/54/a3.jpg',
    },
  ]
}

const popularTags = [
  'food',
  'art',
  'nightlife',
  'nature',
  'history',
  'adventure',
]

const LocalGuides = () => {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [expandedGuide, setExpandedGuide] = useState(null)

  useEffect(() => {
    const loadGuides = async () => {
      setLoading(true)
      try {
        const fetchedGuides = await fetchGuides(location, selectedTags)
        setGuides(fetchedGuides)
      } catch (error) {
        console.error('Failed to fetch guides:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGuides()
  }, [location, selectedTags])

  const handleSearch = (e) => {
    e.preventDefault()
    // This would typically trigger a new search with the current location and tags
  }

  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    )
  }

  const toggleExpand = (guideId) => {
    setExpandedGuide(expandedGuide === guideId ? null : guideId)
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-10'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-xl font-semibold text-gray-100 mb-6'>Local Guides</h2>

      <form onSubmit={handleSearch} className='mb-6'>
        <div className='flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4'>
          <div className='relative flex-grow'>
            <input
              type='text'
              placeholder='Enter a location...'
              className='w-full bg-gray-700 text-white rounded-md border-gray-600 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <MapPin
              className='absolute left-3 top-2.5 text-gray-400'
              size={18}
            />
          </div>
          <button
            type='submit'
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center'
          >
            <Search className='w-4 h-4 mr-2' />
            Search Guides
          </button>
        </div>
      </form>

      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-100 mb-2'>
          Popular Tags
        </h3>
        <div className='flex flex-wrap gap-2'>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <div className='space-y-6'>
          {guides.map((guide) => (
            <motion.div
              key={guide.id}
              className='bg-gray-700 rounded-md overflow-hidden shadow-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='md:flex'>
                <div className='md:flex-shrink-0'>
                  <img
                    className='h-48 w-full object-cover md:w-48'
                    src={guide.imageUrl}
                    alt={guide.title}
                  />
                </div>
                <div className='p-4 flex flex-col justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-100 mb-1'>
                      {guide.title}
                    </h3>
                    <p className='text-sm text-gray-400 mb-2'>
                      {guide.location}
                    </p>
                    <p className='text-gray-300 mb-2'>{guide.description}</p>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {guide.tags.map((tag) => (
                        <span
                          key={tag}
                          className='bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <button
                      onClick={() => toggleExpand(guide.id)}
                      className='text-blue-400 hover:text-blue-300 flex items-center'
                    >
                      {expandedGuide === guide.id ? 'Less info' : 'More info'}
                      {expandedGuide === guide.id ? (
                        <ChevronUp size={16} className='ml-1' />
                      ) : (
                        <ChevronDown size={16} className='ml-1' />
                      )}
                    </button>
                    <a
                      href='#' // Replace with actual link to full guide
                      className='text-blue-400 hover:text-blue-300 flex items-center'
                    >
                      View Full Guide{' '}
                      <ExternalLink size={16} className='ml-1' />
                    </a>
                  </div>
                </div>
              </div>
              {expandedGuide === guide.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='p-4 bg-gray-600'
                >
                  <p className='text-gray-300'>
                    This is where you could add more detailed information about
                    the guide, such as a longer description, highlights, or user
                    reviews.
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!loading && guides.length === 0 && (
        <p className='text-gray-400 text-center'>
          No guides found. Try adjusting your search or tags.
        </p>
      )}
    </motion.div>
  )
}

export default LocalGuides
