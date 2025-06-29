import {
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ref,
} from 'firebase/storage'
import { Activity, ImageIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const ImageViewer = () => {
  const [heatmapUrl, setHeatmapUrl] = useState(null)
  const [trackingLineUrl, setTrackingLineUrl] = useState(null)
  const [loading, setLoading] = useState({ heatmap: true, trackingLine: true })
  const [error, setError] = useState({ heatmap: null, trackingLine: null })
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    fetchLatestImage('heatmaps', setHeatmapUrl, 'heatmap')
    fetchLatestImage('tracking_lines', setTrackingLineUrl, 'trackingLine')
  }, [])

  const fetchLatestImage = async (folderName, setUrl, loadingKey) => {
    try {
      setLoading((prev) => ({ ...prev, [loadingKey]: true }))
      const storage = getStorage()
      const folderRef = ref(storage, folderName)
      const result = await listAll(folderRef)

      const filesWithMetadata = await Promise.all(
        result.items.map(async (item) => {
          const metadata = await getMetadata(item)
          return {
            ref: item,
            metadata,
            created: new Date(metadata.timeCreated),
          }
        })
      )

      const sortedFiles = filesWithMetadata.sort(
        (a, b) => b.created - a.created
      )

      if (sortedFiles.length > 0) {
        const latestFileUrl = await getDownloadURL(sortedFiles[0].ref)
        setUrl(latestFileUrl)
      }
    } catch (err) {
      console.error(`Error fetching ${folderName}:`, err)
      setError((prev) => ({
        ...prev,
        [loadingKey]: `Failed to load ${folderName}`,
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  const renderButton = (type, url, isLoading, errorMessage) => {
    const isHeatmap = type === 'heatmap'
    const title = isHeatmap ? 'Heatmap' : 'Tracking Lines'
    const icon = isHeatmap ? (
      <ImageIcon className='w-5 h-5' />
    ) : (
      <Activity className='w-5 h-5' />
    )

    if (isLoading) {
      return (
        <div className='flex items-center justify-center p-6 bg-[#1e2737] rounded-lg border border-gray-700 shadow-lg mb-4'>
          <div className='animate-spin h-5 w-5 mr-3 border-2 border-blue-500 border-t-transparent rounded-full' />
          <span className='text-gray-300'>Loading {title}...</span>
        </div>
      )
    }

    if (errorMessage) {
      return (
        <div className='p-4 bg-red-900/20 border border-red-700 rounded-lg mb-4'>
          <p className='text-red-400'>{errorMessage}</p>
        </div>
      )
    }

    return (
      <button
        onClick={() => setActiveModal(type)}
        className='w-full p-6 bg-[#1e2737] rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 mb-4 group'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors'>
              {icon}
            </div>
            <div className='text-left'>
              <h3 className='text-lg font-medium text-white'>{title}</h3>
              <p className='text-sm text-gray-400'>
                Click to view latest {title.toLowerCase()}
              </p>
            </div>
          </div>
          <div className='text-blue-400 group-hover:translate-x-1 transition-transform'>
            →
          </div>
        </div>
      </button>
    )
  }

  const renderModal = () => {
    if (!activeModal) return null

    const imageUrl = activeModal === 'heatmap' ? heatmapUrl : trackingLineUrl
    const title = activeModal === 'heatmap' ? 'Heatmap' : 'Tracking Lines'

    return (
      <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50'>
        <div className='relative bg-[#1a2235] rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-medium text-white flex items-center gap-2'>
              {activeModal === 'heatmap' ? (
                <ImageIcon className='w-5 h-5' />
              ) : (
                <Activity className='w-5 h-5' />
              )}
              {title}
            </h2>
            <button
              onClick={() => setActiveModal(null)}
              className='p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors'
            >
              ✕
            </button>
          </div>
          <div className='relative overflow-auto max-h-[calc(90vh-120px)]'>
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className='w-full h-auto rounded-lg border border-gray-700/50'
                loading='lazy'
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-[#151c2b] p-6'>
      <div className='max-w-xl mx-auto'>
        <h1 className='text-2xl font-semibold text-white mb-6'>Image Viewer</h1>
        {renderButton('heatmap', heatmapUrl, loading.heatmap, error.heatmap)}
        {renderButton(
          'trackingLine',
          trackingLineUrl,
          loading.trackingLine,
          error.trackingLine
        )}
        {renderModal()}
      </div>
    </div>
  )
}

export default ImageViewer
