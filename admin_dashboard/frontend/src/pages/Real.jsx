import React, { useState, useEffect, useCallback, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Camera, Save, Upload, Trash2, Maximize2 } from 'lucide-react'
import Header from '../components/common/Header'
import CCTVDashboard from './CCTVDashboard'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
// Toolbar component (unchanged)
const Toolbar = ({ cameras }) => {
  const items = [
    {
      type: 'shelf',
      icon: '/vertical.png',
      orientation: 'vertical',
      sizes: [
        { name: 'small', dimensions: 'w-10 h-24' },
        { name: 'medium', dimensions: 'w-15 h-32' },
        { name: 'large', dimensions: 'w-20 h-48' },
      ],
    },
    {
      type: 'shelf',
      icon: '/horizontal.png',
      orientation: 'horizontal',
      sizes: [
        { name: 'small', dimensions: 'w-24 h-10' },
        { name: 'medium', dimensions: 'w-32 h-15' },
        { name: 'large', dimensions: 'w-48 h-20' },
      ],
    },
    {
      type: 'camera',
      icon: '/camera.png',
      items: cameras,
    },
  ]

  return (
    <div className='bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-xl flex space-x-6'>
      {items.map((item) => (
        <div
          key={item.type + item.orientation}
          className='flex flex-col items-center gap-4'
        >
          {item.type === 'shelf'
            ? item.sizes.map((size) => (
                <DraggableToolbarItem
                  key={`${item.type}-${item.orientation}-${size.name}`}
                  type={item.type}
                  size={size.name}
                  dimensions={size.dimensions}
                  icon={item.icon}
                  orientation={item.orientation}
                />
              ))
            : item.items.map((camera) => (
                <DraggableToolbarItem
                  key={`camera-${camera.id}`}
                  type='camera'
                  item={camera}
                  icon={item.icon}
                />
              ))}
        </div>
      ))}
    </div>
  )
}

const DraggableToolbarItem = ({
  type,
  size,
  dimensions,
  icon,
  orientation,
  item,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NEW_ITEM',
    item: { type, size, dimensions, icon, orientation, ...item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${
        dimensions || 'w-14 h-14'
      } m-2 cursor-move transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg bg-gray-700/60 backdrop-blur-sm p-2 ring-1 ring-white/10 hover:ring-blue-400/50`}
    >
      {typeof icon === 'string' ? (
        <img
          src={icon}
          alt={`${size} ${type}`}
          className='w-full h-full rounded-md'
        />
      ) : (
        React.cloneElement(icon, { className: 'w-full h-full' })
      )}
    </div>
  )
}

const CanvasItem = ({ item, index, updatePosition, gridSize, zIndex }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PLACED_ITEM',
    item: { ...item, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [gridWidth, gridHeight] = gridSize.split('x').map(Number)
  const cellWidth = 600 / gridWidth
  const cellHeight = 600 / gridHeight

  const gridPosition = {
    x: Math.floor(item.left / cellWidth) + 1,
    y: Math.floor(item.top / cellHeight) + 1,
  }

  const getCameraFeed = (camera) => {
    return `http://${camera.ip}:${camera.port}/video`
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
        transform: 'translate(-50%, -50%)',
        zIndex: zIndex, // Use the provided zIndex
      }}
      className={`${item.type === 'camera' ? 'w-24 h-18' : item.dimensions} 
        transition-all duration-300 group hover:z-50`} // Increase z-index on hover
    >
      {item.type === 'camera' ? (
        <div
          className={`relative ${
            isExpanded ? 'scale-150 z-50' : ''
          } transition-transform duration-200`}
        >
          <div className='relative rounded-lg overflow-hidden ring-2 ring-blue-500/50 shadow-lg'>
            <img
              src={getCameraFeed(item)}
              alt={`Feed from ${item.name || 'camera'}`}
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <div className='absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm text-white text-xs transform translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
              {item.name || 'Camera'}: {gridPosition.x},{gridPosition.y}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='absolute top-2 right-2 p-1 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            >
              <Maximize2 className='w-4 h-4 text-white' />
            </button>
          </div>
        </div>
      ) : (
        <div className='relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 shadow-lg ring-1 ring-white/20 hover:ring-blue-400/50'>
          <img
            src={item.icon}
            alt={item.type}
            className='w-full h-full rounded-xl'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>
      )}
    </div>
  )
}

// PlayArea component (updated)

const PlayArea = ({ gridSize = '2x2', items, setItems }) => {
  const [blocks, setBlocks] = useState([])
  const [error, setError] = useState(null)
  const [areaSize, setAreaSize] = useState('800px')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmapData, setHeatmapData] = useState([])
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false)

  const [, drop] = useDrop({
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
        setItems((prevItems) =>
          prevItems.map((prevItem, index) =>
            index === item.index ? newItem : prevItem
          )
        )
      } else {
        setItems((prevItems) => [...prevItems, newItem])
      }
    },
  })

  useEffect(() => {
    if (showHeatmap) {
      const generateHeatmapData = () => {
        const points = []
        const totalPoints = 50
        const width = parseInt(areaSize)
        const height = parseInt(areaSize)

        for (let i = 0; i < totalPoints; i++) {
          points.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 10 + 15,
          })
        }
        return points
      }

      setHeatmapData(generateHeatmapData())
      // Add delay for entrance animation
      setTimeout(() => setIsHeatmapVisible(true), 100)
    } else {
      setIsHeatmapVisible(false)
    }
  }, [showHeatmap, areaSize])

  useEffect(() => {
    try {
      const [width, height] = gridSize.split('x').map(Number)
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        throw new Error('Invalid grid size')
      }

      if (width <= 4 && height <= 4) setAreaSize('800px')
      else if (width <= 9 && height <= 9) setAreaSize('1200px')
      else if (width <= 12 && height <= 12) setAreaSize('1600px')
      else setAreaSize('1000px')

      setBlocks(Array(width * height).fill(null))
      setError(null)
    } catch (err) {
      setError(err.message)
      setBlocks([])
    }
  }, [gridSize])

  if (error) return <div className='text-red-500'>{error}</div>

  const [gridWidth, gridHeight] = gridSize.split('x').map(Number)

  return (
    <div className='relative'>
      <button
        onClick={() => setShowHeatmap(!showHeatmap)}
        className='absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg flex items-center gap-2'
      >
        {showHeatmap ? (
          <>
            <Camera className='w-4 h-4' /> Hide Traffic
          </>
        ) : (
          <>
            <Camera className='w-4 h-4' /> Show Traffic
          </>
        )}
      </button>

      {/* Stylish border container */}
      <div className='relative mx-auto'>
        {/* Corner decorations */}
        <div className='absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-blue-400'></div>
        <div className='absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-blue-400'></div>
        <div className='absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-blue-400'></div>
        <div className='absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-blue-400'></div>

        {/* Main play area */}
        <div
          id='play-area'
          ref={drop}
          className='grid gap-px bg-gray-600 relative mx-auto overflow-hidden rounded-lg shadow-2xl'
          style={{
            gridTemplateColumns: `repeat(${gridSize.split('x')[0]}, 1fr)`,
            width: areaSize,
            height: areaSize,
          }}
        >
          {/* Enhanced heatmap visualization */}
          {showHeatmap && (
            <div
              className={`absolute inset-0 z-10 transition-opacity duration-700 ${
                isHeatmapVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Gradient background */}
              <div
                className='absolute inset-0 bg-gradient-to-br from-green-500/80 via-yellow-500/60 to-red-500/80'
                style={{
                  mixBlendMode: 'overlay',
                  animation: 'gradientShift 8s ease-in-out infinite',
                }}
              />

              {/* Animated dots */}
              <div className='absolute inset-0'>
                {heatmapData.map((point, index) => (
                  <div
                    key={index}
                    className='absolute'
                    style={{
                      left: `${point.x}px`,
                      top: `${point.y}px`,
                      width: `${point.size}px`,
                      height: `${point.size}px`,
                      animation: `appear ${
                        0.5 + index * 0.1
                      }s ease-out forwards, 
                                float ${
                                  2 + Math.random() * 2
                                }s ease-in-out infinite`,
                      opacity: 0,
                    }}
                  >
                    <div
                      className='absolute inset-0 rounded-full'
                      style={{
                        background:
                          'radial-gradient(circle, rgba(220, 38, 38, 0.8) 0%, rgba(220, 38, 38, 0) 70%)',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid blocks */}
          {blocks.map((_, index) => (
            <div
              key={index}
              className={`bg-gray-700 flex flex-wrap items-center justify-center relative ${
                showHeatmap ? 'bg-opacity-30' : 'bg-opacity-100'
              } transition-all duration-500`}
            >
              {index === 0 && (
                <div className='absolute top-0 left-0 text-xs text-white bg-blue-500 p-1 rounded'>
                  Starting Point
                </div>
              )}
              {index === blocks.length - 1 && (
                <div className='absolute bottom-0 right-0 text-xs text-white bg-green-500 p-1 rounded'>
                  Ending Point
                </div>
              )}
            </div>
          ))}

          {/* Canvas items */}
          {items.map((item, index) => (
            <CanvasItem
              key={index}
              item={item}
              index={index}
              gridSize={gridSize}
              updatePosition={(left, top) => {
                setItems((prevItems) =>
                  prevItems.map((prevItem, i) =>
                    i === index ? { ...prevItem, left, top } : prevItem
                  )
                )
              }}
              zIndex={20}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes appear {
          0% {
            opacity: 0;
            transform: scale(0) translate(-50%, -50%);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate(-50%, -50%);
          }
        }

        @keyframes float {
          0% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
          100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}

const RetailStorePlanner = () => {
  const [gridSize, setGridSize] = useState('')
  const [items, setItems] = useState([])
  const playAreaRef = useRef(null)
  const cameras = [
    { id: 1, name: 'Camera 1', ip: '192.168.18.86', port: 4747 },
    { id: 2, name: 'Camera 2', ip: '192.168.18.102', port: 4747 },
    { id: 3, name: 'Camera 3', ip: '192.168.18.25', port: 4747 },
    { id: 4, name: 'Camera 4', ip: '192.168.1.103', port: 4747 },
  ]

  const getOrientation = (left, top, gridSize) => {
    const [width, height] = gridSize.split('x').map(Number)
    const cellWidth = 600 / width
    const cellHeight = 600 / height

    const x = Math.floor(left / cellWidth)
    const y = Math.floor(top / cellHeight)

    const horizontalPosition =
      x < width / 3 ? 'left' : x > (2 * width) / 3 ? 'right' : 'center'
    const verticalPosition =
      y < height / 3 ? 'top' : y > (2 * height) / 3 ? 'bottom' : 'center'

    return `${verticalPosition}-${horizontalPosition}`
  }

  const handleSave = () => {
    if (!gridSize) {
      alert('Please set a grid size before saving.')
      return
    }

    // Capture screenshot
    if (playAreaRef.current) {
      html2canvas(playAreaRef.current).then((canvas) => {
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          // Create a download link
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'retail-store-layout.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      })
    }
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
    <div className='flex-1 relative z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <Header title={'Planogram'} />
      <DndProvider backend={HTML5Backend}>
        <div className='min-h-screen flex'>
          {/* Left Panel - Items */}
          <div className='w-1/4 p-6 border-r border-gray-700 bg-gray-900/50'>
            <h2 className='text-xl font-bold mb-4 text-white/90'>Items</h2>
            <Toolbar cameras={cameras} />
          </div>

          {/* Right Panel - Play Area */}
          <div className='w-3/4 p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-white/90'>
                Layout Designer
              </h1>
              <div className='flex gap-4'>
                <input
                  type='text'
                  placeholder='Enter grid size (i.e 1=10 ft)'
                  value={gridSize}
                  onChange={(e) => setGridSize(e.target.value)}
                  className='bg-gray-700/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg ring-1 ring-white/20 focus:ring-blue-400 focus:outline-none transition-all duration-300'
                />
                <button
                  onClick={() => setGridSize(gridSize)}
                  className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg'
                >
                  Set Grid
                </button>
              </div>
            </div>

            <div
              ref={playAreaRef}
              className='bg-gray-800/50 rounded-xl p-4 shadow-xl'
            >
              <PlayArea gridSize={gridSize} items={items} setItems={setItems} />
            </div>

            <div className='mt-6 flex justify-end space-x-4'>
              <button
                onClick={handleSave}
                className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg transition-colors duration-300'
              >
                <Save className='mr-2' /> Save
              </button>
              {/* <label className='bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg flex items-center cursor-pointer shadow-lg transition-colors duration-300'>
                <Upload className='mr-2' /> Load
                <input
                  type='file'
                  onChange={handleLoad}
                  className='hidden'
                  accept='.json'
                />
              </label> */}
              <button
                onClick={handleClear}
                className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg transition-colors duration-300'
              >
                <Trash2 className='mr-2' /> Clear
              </button>
            </div>
          </div>
        </div>
      </DndProvider>
      <CCTVDashboard />
    </div>
  )
}
export default RetailStorePlanner
