import React, { useState, useEffect, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Camera, Save, Upload, Trash2 } from 'lucide-react'
import Header from '../components/common/Header'
import CCTVDashboard from './CCTVDashboard'

// Toolbar component (unchanged)
const Toolbar = () => {
  const items = [
    {
      type: 'shelf',
      icon: 'shelf.png',
      sizes: ['small', 'medium', 'large'],
    },
  ]

  return (
    <div className='bg-gray-800 p-4 flex space-x-4'>
      {items.map((item) => (
        <div key={item.type} className='flex flex-col items-center'>
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
    </div>
  )
}

// DraggableToolbarItem component (unchanged)
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
      <img src={icon} alt={`${size} ${type}`} className='w-full h-full' />
    </div>
  )
}

// CanvasItem component (new)
const CanvasItem = ({ item, index, updatePosition }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PLACED_ITEM',
    item: { ...item, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const getItemSize = (size) => {
    switch (size) {
      case 'small':
        return 'w-10 h-10'
      case 'medium':
        return 'w-14 h-14'
      case 'large':
        return 'w-20 h-20'
      default:
        return 'w-6 h-6'
    }
  }

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        position: 'absolute',
        left: `${item.left}px`,
        top: `${item.top}px`,
        cursor: 'move',
      }}
      className={`${getItemSize(item.size)}`}
    >
      <img src={item.icon} alt={item.type} className='w-full h-full' />
    </div>
  )
}

// PlayArea component (significantly modified)
const PlayArea = ({ gridSize, items, setItems }) => {
  const [blocks, setBlocks] = useState([])
  const [trafficAreas, setTrafficAreas] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const [width, height] = gridSize.split('x').map(Number)
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        throw new Error(
          'Invalid grid size. Please enter positive numbers in the format "width x height".'
        )
      }
      const horizBlocks = Math.floor(width / 10)
      const vertBlocks = Math.floor(height / 10)
      const totalBlocks = horizBlocks * vertBlocks
      if (totalBlocks > 10000) {
        throw new Error('Grid size too large. Please enter a smaller size.')
      }
      setBlocks(
        Array(totalBlocks)
          .fill(null)
          .map(() => ({
            top: Math.random() < 0.5 ? 'blue' : 'red',
            bottom: Math.random() < 0.5 ? 'blue' : 'red',
            left: Math.random() < 0.5 ? 'blue' : 'red',
            right: Math.random() < 0.5 ? 'blue' : 'red',
          }))
      )
      setTrafficAreas(
        Array(totalBlocks)
          .fill(null)
          .map(() => ({
            opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
          }))
      )
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message)
      setBlocks([])
      setTrafficAreas([])
    }
  }, [gridSize])

  const [, drop] = useDrop(() => ({
    accept: ['NEW_ITEM', 'PLACED_ITEM'],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const canvas = document.getElementById('play-area')
      const canvasRect = canvas.getBoundingClientRect()

      const newItem = {
        ...item,
        left: offset.x - canvasRect.left,
        top: offset.y - canvasRect.top,
      }

      if (item.index !== undefined) {
        // Moving an existing item
        setItems((prevItems) =>
          prevItems.map((prevItem, index) =>
            index === item.index ? newItem : prevItem
          )
        )
      } else {
        // Adding a new item
        setItems((prevItems) => [...prevItems, newItem])
      }
    },
  }))

  if (error) {
    return <div className='text-red-500'>{error}</div>
  }

  return (
    <div
      id='play-area'
      ref={drop}
      className='grid gap-px bg-gray-600 relative'
      style={{
        gridTemplateColumns: `repeat(${Math.sqrt(blocks.length)}, 1fr)`,
        width: '100%',
        height: '600px',
      }}
    >
      {blocks.map((block, index) => (
        <div
          key={index}
          className='bg-gray-700 flex flex-wrap items-center justify-center relative'
        >
          <div
            className='absolute top-0 left-0 w-4 h-35 rounded-full'
            style={{ backgroundColor: block.top }}
          ></div>
          <div
            className='absolute bottom-0 left-0 w-4 h-40 rounded-full'
            style={{ backgroundColor: block.bottom }}
          ></div>
          <div
            className='absolute top-0 left-0 w-4 h-40 rounded-full'
            style={{ backgroundColor: block.left }}
          ></div>
          <div
            className='absolute top-0 right-100 w-40 h-40 opacity-25 rounded-full'
            style={{ backgroundColor: block.right }}
          ></div>
          <div
            className='absolute top-0 right-0 w-40 h-40 opacity-25 rounded-full'
            style={{ backgroundColor: block.left }}
          ></div>
          <div
            className='absolute top-0 left-7 w-40 h-40 opacity-25 rounded-full'
            style={{ backgroundColor: block.left }}
          ></div>
          <div
            className='absolute bottom-10 left-7 w-40 h-40 opacity-25 rounded-full'
            style={{ backgroundColor: block.right }}
          ></div>
          <div
            className='absolute top-0 right-0 w-4 h-40 rounded-full'
            style={{ backgroundColor: block.left }}
          ></div>
          <div
            className='absolute inset-0'
            style={{
              backgroundColor: trafficAreas[index].color,
              opacity: trafficAreas[index].opacity,
            }}
          ></div>
        </div>
      ))}
      {items.map((item, index) => (
        <CanvasItem
          key={index}
          item={item}
          index={index}
          updatePosition={(left, top) => {
            setItems((prevItems) =>
              prevItems.map((prevItem, i) =>
                i === index ? { ...prevItem, left, top } : prevItem
              )
            )
          }}
        />
      ))}
    </div>
  )
}

// Main RetailStorePlanner component (slightly modified)
const RetailStorePlanner = () => {
  const [gridSize, setGridSize] = useState('')
  const [items, setItems] = useState([])

  const handleSave = () => {
    const data = JSON.stringify({ gridSize, items })
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'retail-store-layout.svg'
    a.click()
  }

  const handleLoad = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = JSON.parse(e.target.result)
        setGridSize(content.gridSize)
        setItems(content.items)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setItems([])
  }

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <Header title={'Planogram'} />
      <DndProvider backend={HTML5Backend}>
        <div className='bg-gray-900 text-white min-h-screen p-4'>
          <h1 className='text-2xl mb-4'>Retail Store Layout Planner</h1>
          <div className='mb-4'>
            <input
              type='text'
              placeholder='Enter grid size (e.g., 20x20)'
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value)}
              className='bg-gray-700 text-white px-3 py-2 rounded mr-2'
            />
            <button
              onClick={() => setGridSize(gridSize)}
              className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
            >
              Set Grid
            </button>
          </div>
          <Toolbar />
          <PlayArea gridSize={gridSize} items={items} setItems={setItems} />
          <div className='mt-4 flex justify-center space-x-4'>
            <button
              onClick={handleSave}
              className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center'
            >
              <Save className='mr-2' /> Save
            </button>
            <label className='bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center cursor-pointer'>
              <Upload className='mr-2' /> Load
              <input
                type='file'
                onChange={handleLoad}
                className='hidden'
                accept='.json'
              />
            </label>
            <button
              onClick={handleClear}
              className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center'
            >
              <Trash2 className='mr-2' /> Clear
            </button>
          </div>
        </div>
      </DndProvider>
      <CCTVDashboard />
    </div>
  )
}

export default RetailStorePlanner
