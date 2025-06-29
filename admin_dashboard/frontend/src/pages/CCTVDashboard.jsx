import React, { useState } from 'react'
import { X } from 'lucide-react'
import Header from '../components/common/Header'

const CCTVDashboard = () => {
  const [selectedCamera, setSelectedCamera] = useState(null)

  const cameras = [
    { id: 1, name: 'Camera 1', ip: '192.168.18.139', port: 4747 },
    { id: 2, name: 'Camera 2', ip: '192.168.18.60', port: 4747 },
    { id: 3, name: 'Camera 3', ip: '192.168.18.130', port: 4747 },
    { id: 4, name: 'Camera 4', ip: '192.168.1.103', port: 4747 },
  ]

  const handleCameraClick = (camera) => {
    setSelectedCamera(camera)
  }

  const closePopup = () => {
    setSelectedCamera(null)
  }

  const getCameraFeed = (camera) => {
    return `http://${camera.ip}:${camera.port}/video`
  }

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <Header title={'CCTV Dashboard'} />
      <div className='bg-gray-900 min-h-screen p-8'>
        {/* <h1 className="text-3xl font-bold mb-8 text-white">CCTV Dashboard</h1> */}
        <div className='grid grid-cols-2 gap-4'>
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className='bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors'
              onClick={() => handleCameraClick(camera)}
            >
              <h2 className='text-xl font-semibold mb-2 text-white'>
                {camera.name}
              </h2>
              <img
                src={getCameraFeed(camera)}
                alt={`Feed from ${camera.name}`}
                className='w-full h-auto rounded'
              />
              <p className='mt-2 text-gray-300'>
                IP: {camera.ip}:{camera.port}
              </p>
            </div>
          ))}
        </div>
        {selectedCamera && (
          <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
            <div className='bg-gray-800 p-6 rounded-lg max-w-3xl w-full'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold text-white'>
                  {selectedCamera.name}
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
                alt={`Feed from ${selectedCamera.name}`}
                className='w-full h-auto rounded'
              />
              <p className='mt-4 text-gray-300'>
                IP: {selectedCamera.ip}:{selectedCamera.port}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CCTVDashboard
