import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import html2canvas from 'html2canvas'
import { Camera, Maximize2, Save, Trash2, Upload } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import * as XLSX from 'xlsx'
import Header from '../components/common/Header'
import CCTVDashboard from './CCTVDashboard'
import HeatmapViewer from './Hetamap'
// Toolbar component (unchanged)

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
        dimensions || 'w-10 h-10 md:w-14 md:h-14'
      } m-1 md:m-2 cursor-move transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg bg-gray-700/60 backdrop-blur-sm p-1 md:p-2 ring-1 ring-white/10 hover:ring-blue-400/50`}
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

const Toolbar = ({ cameras }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const items = [
    {
      type: 'shelf',
      orientation: 'vertical',
      sizes: [
        { name: 'small', dimensions: 'w-10 h-24', icon: '/vertical-small.png' },
        {
          name: 'medium',
          dimensions: 'w-15 h-32',
          icon: '/vertical-medium.png',
        },
        { name: 'large', dimensions: 'w-20 h-48', icon: '/vertical-large.png' },
      ],
    },
    {
      type: 'shelf',
      orientation: 'horizontal',
      sizes: [
        {
          name: 'small',
          dimensions: 'w-24 h-10',
          icon: '/horizontal-small.png',
        },
        {
          name: 'medium',
          dimensions: 'w-32 h-15',
          icon: '/horizontal-medium.png',
        },
        {
          name: 'large',
          dimensions: 'w-48 h-20',
          icon: '/horizontal-large.png',
        },
      ],
    },
    {
      type: 'marker',
      items: [
        {
          type: 'entry',
          name: 'Entry Point',
          dimensions: 'w-30 h-30',
          icon: '/entry.png',
        },
        {
          type: 'exit',
          name: 'Exit Point',
          dimensions: 'w-30 h-30',
          icon: '/exit.png',
        },
        {
          type: 'exitt',
          name: 'Exitt Point',
          dimensions: 'w-30 h-30',
          icon: '/exit-o.png',
        },
        {
          type: 'exitt',
          name: 'Exitt Point',
          dimensions: 'w-30 h-30',
          icon: '/exit-l.png',
        },
        {
          type: 'exitt',
          name: 'Exitt Point',
          dimensions: 'w-30 h-30',
          icon: '/exit-r.png',
        },
      ],
    },
    {
      type: 'camera',
      icon: '/camera.png',
      items: cameras,
    },
  ]

  return (
    <div className='bg-gray-800/90 backdrop-blur-sm p-2 md:p-6 rounded-lg shadow-xl'>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className='md:hidden w-full text-white mb-2 p-2 bg-gray-700 rounded-lg'
      >
        {isCollapsed ? 'Show Tools' : 'Hide Tools'}
      </button>
      <div
        className={`flex flex-wrap md:flex-nowrap gap-2 md:gap-6 ${
          isCollapsed ? 'hidden' : 'flex'
        } md:flex`}
      >
        {items.map((category) => (
          <div
            key={category.type + (category.orientation || '')}
            className='flex flex-wrap md:flex-col items-center gap-2 md:gap-4'
          >
            {category.type === 'shelf'
              ? category.sizes.map((size) => (
                  <DraggableToolbarItem
                    key={`${category.type}-${category.orientation}-${size.name}`}
                    type={category.type}
                    size={size.name}
                    dimensions={size.dimensions}
                    icon={size.icon}
                    orientation={category.orientation}
                  />
                ))
              : category.type === 'marker'
              ? category.items.map((item) => (
                  <DraggableToolbarItem
                    key={`marker-${item.type}`}
                    type='marker'
                    markerType={item.type}
                    name={item.name}
                    dimensions={item.dimensions}
                    icon={item.icon}
                  />
                ))
              : category.items.map((camera) => (
                  <DraggableToolbarItem
                    key={`camera-${camera.id}`}
                    type='camera'
                    item={camera}
                    icon={category.icon}
                  />
                ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Updated CanvasItem component to handle markers
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

  const renderContent = () => {
    if (item.type === 'camera') {
      return (
        <div
          className={`relative transition-all duration-300 ${
            isExpanded
              ? 'fixed inset-0 w-full h-full bg-black/90 z-50 flex items-center justify-center'
              : ''
          }`}
        >
          <div
            className={`relative rounded-lg overflow-hidden ring-2 ring-blue-500/50 shadow-lg ${
              isExpanded
                ? 'w-[90%] h-[90%] max-w-7xl max-h-[80vh]'
                : 'w-full h-full'
            }`}
          >
            <img
              src={getCameraFeed(item)}
              alt={`Feed from ${item.name || 'camera'}`}
              className={`w-full h-full object-cover ${
                isExpanded ? 'rounded-xl' : ''
              }`}
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
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className='absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors duration-300'
            >
              <Maximize2 className='w-6 h-6 text-white' />
            </button>
          )}
        </div>
      )
    } else if (item.type === 'marker') {
      return (
        <div className='relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 shadow-lg'>
          <img
            src={item.icon}
            alt={item.markerType}
            className='w-full h-full object-contain'
          />
          <div className='absolute bottom-0 left-0 right-0 p-1 bg-black/40 backdrop-blur-sm text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            {item.name}: {gridPosition.x},{gridPosition.y}
          </div>
        </div>
      )
    } else {
      return (
        <div className='relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 shadow-lg ring-1 ring-white/20 hover:ring-blue-400/50'>
          <img
            src={item.icon}
            alt={item.type}
            className='w-full h-full rounded-xl'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>
      )
    }
  }

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        position: isExpanded ? 'fixed' : 'absolute',
        left: isExpanded ? '50%' : `${item.left}px`,
        top: isExpanded ? '50%' : `${item.top}px`,
        cursor: isExpanded ? 'default' : 'move',
        transform: isExpanded
          ? 'translate(-50%, -50%)'
          : 'translate(-50%, -50%)',
        zIndex: isExpanded ? 50 : zIndex,
      }}
      className={`${
        item.type === 'marker'
          ? item.dimensions
          : item.type === 'camera'
          ? isExpanded
            ? 'w-full h-full'
            : 'w-24 h-18'
          : item.dimensions
      } transition-all duration-300 group hover:z-50`}
    >
      {renderContent()}
    </div>
  )
}

// PlayArea component (updated)

// PlayArea component with integrated heatmap
const PlayArea = ({ gridSize, items, setItems }) => {
  const [blocks, setBlocks] = useState([])
  const [error, setError] = useState(null)
  const [areaSize, setAreaSize] = useState('800px')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [timeFilter, setTimeFilter] = useState('3d')
  const canvasRef = useRef(null)

  const calculateAreaSize = () => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const [width, height] = gridSize.split('x').map(Number)

    // For mobile
    if (viewportWidth < 768) {
      return `${Math.min(viewportWidth - 32, viewportHeight - 200)}px`
    }

    // For larger screens
    if (width <= 4 && height <= 4) return 'min(800px, 80vw)'
    if (width <= 9 && height <= 9) return 'min(1200px, 85vw)'
    if (width <= 12 && height <= 12) return 'min(1600px, 90vw)'
    return 'min(1000px, 80vw)'
  }
  useEffect(() => {
    const handleResize = () => {
      setAreaSize(calculateAreaSize())
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [gridSize])

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

  const generateSampleData = () => {
    const points = []
    // Generate central high-intensity cluster
    for (let i = 0; i < 60; i++) {
      points.push({
        x: 400 + Math.random() * 200 - 100,
        y: 300 + Math.random() * 200 - 100,
        value: Math.random() * 0.3 + 0.7, // High values for center
      })
    }
    // Generate medium-intensity points
    for (let i = 0; i < 40; i++) {
      points.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        value: Math.random() * 0.3 + 0.3, // Medium values
      })
    }
    // Generate low-intensity scattered points
    for (let i = 0; i < 30; i++) {
      points.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        value: Math.random() * 0.2 + 0.1, // Low values
      })
    }
    return points
  }

  const getColor = (value) => {
    // Create vibrant transitions between red, yellow, and green
    if (value < 0.33) {
      // Green to Yellow transition (for low values)
      const ratio = value * 3
      return {
        r: Math.round(255 * ratio),
        g: 255,
        b: 0,
      }
    } else if (value < 0.66) {
      // Yellow to Red transition (for medium values)
      const ratio = (value - 0.33) * 3
      return {
        r: 255,
        g: Math.round(255 * (1 - ratio)),
        b: 0,
      }
    } else {
      // Pure Red (for high values)
      return {
        r: 255,
        g: 0,
        b: 0,
      }
    }
  }

  const drawHeatmap = useCallback((ctx, width, height, data) => {
    const intensityData = new Uint8ClampedArray(width * height * 4)

    data.forEach((point) => {
      const radius = 120
      const intensity = point.value

      for (
        let y = Math.max(0, Math.floor(point.y - radius));
        y < Math.min(height, Math.ceil(point.y + radius));
        y++
      ) {
        for (
          let x = Math.max(0, Math.floor(point.x - radius));
          x < Math.min(width, Math.ceil(point.x + radius));
          x++
        ) {
          const distance = Math.sqrt(
            Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
          )
          if (distance < radius) {
            const index = (y * width + x) * 4
            const factor = Math.pow(1 - distance / radius, 2) * intensity
            const color = getColor(factor)

            // Increase color intensity by using higher base values
            intensityData[index] = Math.max(intensityData[index], color.r)
            intensityData[index + 1] = Math.max(
              intensityData[index + 1],
              color.g
            )
            intensityData[index + 2] = Math.max(
              intensityData[index + 2],
              color.b
            )
            // Increase opacity for more vibrant appearance
            intensityData[index + 3] = Math.min(
              255,
              intensityData[index + 3] + factor * 255 * 1.2
            )
          }
        }
      }
    })

    const imageData = new ImageData(intensityData, width, height)
    ctx.putImageData(imageData, 0, 0)
  }, [])

  useEffect(() => {
    if (showHeatmap && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      const data = generateSampleData()
      drawHeatmap(ctx, width, height, data)

      ctx.globalCompositeOperation = 'destination-over'
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#f2771f')
      bgGradient.addColorStop(1, '#f2771f')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
    }
  }, [showHeatmap, drawHeatmap])

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

  return (
    <div className='relative'>
      <div className='absolute top-2 right-2 md:top-4 md:right-4 z-20 flex flex-col gap-2 md:gap-4'>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg flex items-center gap-2'
        >
          <Camera className='w-4 h-4' />
          {showHeatmap ? 'Hide Traffic' : 'Show Traffic'}
        </button>

        {/* Color Legend */}
        {showHeatmap && (
          <div className='bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg'>
            <h3 className='text-white text-sm font-semibold mb-2'>
              Traffic Legend
            </h3>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 rounded-full bg-red-500'></div>
                <span className='text-white text-xs'>High Traffic</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 rounded-full bg-yellow-400'></div>
                <span className='text-white text-xs'>Medium Traffic</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 rounded-full bg-green-500'></div>
                <span className='text-white text-xs'>Low Traffic</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='relative mx-auto'>
        <div className='absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-blue-400'></div>
        <div className='absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-blue-400'></div>
        <div className='absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-blue-400'></div>
        <div className='absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-blue-400'></div>

        <div
          id='play-area'
          ref={drop}
          className='grid gap-px bg-white relative mx-auto overflow-hidden rounded-lg shadow-2xl'
          style={{
            gridTemplateColumns: `repeat(${gridSize.split('x')[0]}, 1fr)`,
            width: areaSize,
            height: areaSize,
          }}
        >
          {/* Heatmap Canvas */}
          {showHeatmap && (
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className='absolute inset-0 z-10 w-full h-full opacity-70'
            />
          )}

          {/* Grid Blocks */}
          {blocks.map((_, index) => (
            <div
              key={index}
              className={`bg-gray-50 flex flex-wrap items-center justify-center relative ${
                showHeatmap ? 'bg-opacity-50' : 'bg-opacity-100'
              } transition-all duration-500`}
            />
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
    </div>
  )
}

// ... previous imports and components remain the same ...
const RetailStorePlanner = () => {
  const [gridSize, setGridSize] = useState('2x2')
  const [items, setItems] = useState([])
  const [showGallery, setShowGallery] = useState(false)
  const [savedDesigns, setSavedDesigns] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLiveHeatmap, setShowLiveHeatmap] = useState(false)
  const playAreaRef = useRef(null)
  const cameras = [
    { id: 1, name: 'Camera 1', ip: '192.168.137.13', port: 4747 },
    { id: 2, name: 'Camera 2', ip: '10.113.75.172', port: 4747 },
    { id: 3, name: 'Camera 3', ip: '192.168.18.25', port: 4747 },
    { id: 4, name: 'Camera 4', ip: '192.168.1.103', port: 4747 },
  ]

  useEffect(() => {
    loadSavedDesigns()
  }, [])

  const loadSavedDesigns = () => {
    const designs = JSON.parse(localStorage.getItem('savedDesigns') || '[]')
    setSavedDesigns(designs)
  }

  const handleSave = async () => {
    if (!gridSize) {
      alert('Please set a grid size before saving.')
      return
    }

    if (playAreaRef.current) {
      const canvas = await html2canvas(playAreaRef.current)
      canvas.toBlob(async (blob) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const base64data = reader.result
          const design = {
            id: Date.now(),
            image: base64data,
            gridSize,
            items: items.map((item) => ({
              ...item,
              left: item.left,
              top: item.top,
              type: item.type,
              id: item.id,
              name: item.name,
              ip: item.ip,
              port: item.port,
            })),
            timestamp: new Date().toISOString(),
          }

          const updatedDesigns = [...savedDesigns, design]
          setSavedDesigns(updatedDesigns)
          localStorage.setItem('savedDesigns', JSON.stringify(updatedDesigns))
        }
      })
    }
  }

  const ImageGallery = () => {
    if (!showGallery) return null

    const loadDesign = (design) => {
      setGridSize(design.gridSize)
      setItems(design.items)
      setShowGallery(false)
    }

    return (
      <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50'>
        <div className='bg-gray-800 p-6 rounded-xl max-w-4xl w-full mx-4 relative'>
          <button
            onClick={() => setShowGallery(false)}
            className='absolute top-4 right-4 text-white/60 hover:text-white'
          >
            ✕
          </button>

          {savedDesigns.length > 0 ? (
            <div className='relative'>
              <img
                src={savedDesigns[currentImageIndex].image}
                alt={`Design ${currentImageIndex + 1}`}
                className='w-full rounded-lg'
              />

              <div className='flex justify-center gap-4 mt-4'>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev > 0 ? prev - 1 : savedDesigns.length - 1
                    )
                  }
                  className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
                >
                  Previous
                </button>

                <button
                  onClick={() => loadDesign(savedDesigns[currentImageIndex])}
                  className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg'
                >
                  Load Design
                </button>

                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev < savedDesigns.length - 1 ? prev + 1 : 0
                    )
                  }
                  className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
                >
                  Next
                </button>
              </div>

              <div className='text-center text-white mt-4'>
                Design {currentImageIndex + 1} of {savedDesigns.length}
              </div>
            </div>
          ) : (
            <div className='text-white text-center py-8'>
              No saved designs yet
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleClear = () => {
    setItems([])
  }

  return (
    <div className='flex-1 relative z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <Header title={'Planogram'} />
      <DndProvider backend={HTML5Backend}>
        <div className='min-h-screen flex flex-col md:flex-row'>
          {/* Left Panel - Items */}
          <div className='w-full md:w-1/4 p-2 md:p-6 border-b md:border-b-0 md:border-r border-gray-700 bg-gray-900/50'>
            <h2 className='text-lg md:text-xl font-bold mb-2 md:mb-4 text-white/90'>
              Items
            </h2>
            <Toolbar cameras={cameras} />
          </div>

          {/* Right Panel - Play Area */}
          <div className='w-full md:w-3/4 p-2 md:p-6'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-2'>
              <h1 className='text-xl md:text-2xl font-bold text-white/90'>
                Layout Designer
              </h1>
              <div className='flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto'>
                <input
                  type='text'
                  placeholder='Grid size (1=10 ft)'
                  value={gridSize}
                  onChange={(e) => setGridSize(e.target.value)}
                  className='w-full md:w-auto bg-gray-700/50 backdrop-blur-sm text-white px-3 md:px-4 py-2 rounded-lg ring-1 ring-white/20 focus:ring-blue-400 focus:outline-none transition-all duration-300 text-sm md:text-base'
                />
                <button
                  onClick={() => setGridSize(gridSize)}
                  className='w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 md:px-6 rounded-lg transition-colors duration-300 shadow-lg text-sm md:text-base'
                >
                  Set Grid
                </button>
              </div>
            </div>

            <div
              ref={playAreaRef}
              className='bg-gray-800/50 rounded-xl p-2 md:p-4 shadow-xl'
            >
              <PlayArea gridSize={gridSize} items={items} setItems={setItems} />
            </div>

            <div className='mt-4 md:mt-6 flex flex-wrap md:flex-nowrap justify-center md:justify-end gap-2 md:gap-4'>
              <button
                onClick={handleSave}
                className='flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-300 text-sm md:text-base'
              >
                <Save className='mr-2 w-4 h-4 md:w-5 md:h-5' /> Save
              </button>
              <button
                onClick={() => setShowGallery(true)}
                className='flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-300 text-sm md:text-base'
              >
                <Upload className='mr-2 w-4 h-4 md:w-5 md:h-5' /> View Saved
              </button>
              <button
                onClick={handleClear}
                className='flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-300 text-sm md:text-base'
              >
                <Trash2 className='mr-2 w-4 h-4 md:w-5 md:h-5' /> Clear
              </button>
            </div>

            {/* Live Heatmap Section */}
            <HeatmapViewer />
          </div>
        </div>
      </DndProvider>

      <ImageGallery />
    </div>
  )
}

export default RetailStorePlanner
