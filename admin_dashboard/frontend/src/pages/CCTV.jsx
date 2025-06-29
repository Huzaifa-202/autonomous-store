import React, { useState } from 'react'
import { X } from 'lucide-react'
import Header from '../components/common/Header'

const CCTVDashboard = ({ placedCameras }) => {
  const [selectedCamera, setSelectedCamera] = useState(null)

  const handleCameraClick = (camera) => {
    setSelectedCamera(camera)
  }

  const closePopup = () => {
    setSelectedCamera(null)
  }

  const getCameraFeed = (camera) => {
    return `http://${camera.ip}:${camera.port}/video`
  }

  const getGridPosition = (camera) => {
    if (!camera.gridSize || !camera.left || !camera.top) {
      return 'Unknown'
    }
    const [gridWidth, gridHeight] = camera.gridSize.split('x').map(Number)
    const x = Math.floor(camera.left / (600 / gridWidth)) + 1
    const y = Math.floor(camera.top / (600 / gridHeight)) + 1
    return `${x}, ${y}`
  }

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <Header title={'CCTV Dashboard'} />
      <div className='bg-gray-900 min-h-screen p-8'>
        <div className='grid grid-cols-2 gap-4'>
          {placedCameras.map((camera) => (
            <div
              key={camera.id}
              className='bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors'
              onClick={() => handleCameraClick(camera)}
            >
              <h2 className='text-xl font-semibold mb-2 text-white'>
                {camera.name || 'Unnamed Camera'}
              </h2>
              <img
                src={getCameraFeed(camera)}
                alt={`Feed from ${camera.name || 'camera'}`}
                className='w-full h-auto rounded'
              />
              <p className='mt-2 text-gray-300'>
                IP: {camera.ip || 'Unknown'}:{camera.port || 'Unknown'}
              </p>
              {/* <p className='mt-1 text-gray-300'>
                Grid Position: {getGridPosition(camera)}
              </p> */}
            </div>
          ))}
        </div>
        {selectedCamera && (
          <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
            <div className='bg-gray-800 p-6 rounded-lg max-w-3xl w-full'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold text-white'>
                  {selectedCamera.name || 'Unnamed Camera'}
                </h2>
                <button
                  onClick={closePopup}
                  className='text-gray-300 hover:text-white transition-colors'
                >
                  <X size={24} />
                </button>
              </div>
              <img
                src={getCameraFeed(selectedCamera)}
                alt={`Feed from ${selectedCamera.name || 'camera'}`}
                className='w-full h-auto rounded'
              />
              <p className='mt-4 text-gray-300'>
                IP: {selectedCamera.ip || 'Unknown'}:
                {selectedCamera.port || 'Unknown'}
              </p>
              <p className='mt-1 text-gray-300'>
                Grid Position: {getGridPosition(selectedCamera)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CCTVDashboard
