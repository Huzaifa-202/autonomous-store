import React from 'react'
import { useDrag } from 'react-dnd'
import { Camera } from 'lucide-react'

// Updated Toolbar component
const Toolbar = ({ cameras }) => {
  const items = [
    {
      type: 'vertical-shelf',
      icon: verticalShelfImage,
      sizes: ['small', 'medium', 'large'],
    },
    {
      type: 'horizontal-shelf',
      icon: horizontalShelfImage,
      sizes: ['small', 'medium', 'large'],
    },
  ]

  return (
    <div className='bg-gray-800 p-4 flex space-x-4'>
      {items.map((item) => (
        <div key={item.type} className='flex flex-col items-center'>
          <h3 className='text-white mb-2'>{item.type}</h3>
          {item.sizes.map((size) => (
            <DraggableToolbarItem
              key={`${item.type}-${size}`}
              type={item.type}
              size={size}
              icon={item.icon}
            />
          ))}
        </div>
      ))}
      <div className='flex flex-col items-center'>
        <h3 className='text-white mb-2'>Cameras</h3>
        {cameras.map((camera) => (
          <DraggableCameraItem key={camera.id} camera={camera} />
        ))}
      </div>
    </div>
  )
}

// Updated DraggableToolbarItem component
const DraggableToolbarItem = ({ type, size, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NEW_ITEM',
    item: { type, size, icon },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const getItemSize = (size) => {
    switch (size) {
      case 'small':
        return 'w-8 h-8'
      case 'medium':
        return 'w-12 h-12'
      case 'large':
        return 'w-16 h-16'
      default:
        return 'w-8 h-8'
    }
  }

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${getItemSize(size)} m-2 cursor-move`}
    >
      <img
        src={icon}
        alt={`${size} ${type}`}
        className='w-full h-full object-contain'
      />
    </div>
  )
}

// New DraggableCameraItem component
const DraggableCameraItem = ({ camera }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NEW_ITEM',
    item: { type: 'camera', cameraId: camera.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className='w-12 h-12 m-2 cursor-move bg-gray-700 rounded flex items-center justify-center'
    >
      <Camera size={24} color='white' />
      <span className='text-white text-xs ml-1'>{camera.id}</span>
    </div>
  )
}

export { Toolbar, DraggableToolbarItem, DraggableCameraItem }
