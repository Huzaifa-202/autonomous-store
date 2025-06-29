import axios from 'axios'
import { saveAs } from 'file-saver'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  TrendingUp,
} from 'lucide-react'
import Papa from 'papaparse'
import React, { useEffect, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as XLSX from 'xlsx'
import Header from '../components/common/Header'

const Card = ({ children, className = '' }) => (
  <div
    className={`bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg ${className}`}
  >
    {children}
  </div>
)

const ChartCard = ({ children }) => (
  <div className='relative'>
    {/* Background blur effect for chart area only */}
    <div className='absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-gray-800/50 to-transparent backdrop-blur-sm' />

    {/* Chart content */}
    <div className='relative'>
      <div className='p-6'>
        <h3 className='text-xl text-white font-semibold mb-6'>
          Sales Forecast Graph
        </h3>
        <div className='h-[400px] md:h-[500px]'>
          <ResponsiveContainer width='100%' height='100%'>
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
)

const SalesPrediction = () => {
  const [plotData, setPlotData] = useState([])
  const [csvData, setCsvData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [predictionPeriod, setPredictionPeriod] = useState('1 year')
  const [downloadFormat, setDownloadFormat] = useState('csv')
  const [totalSales, setTotalSales] = useState(null)
  const [isTableExpanded, setIsTableExpanded] = useState(false)

  const fetchData = async (period) => {
    try {
      setLoading(true)
      const response = await axios.get(
        `http://localhost:8000/forecast/${period}`
      )
      const { plot_data, csv_data, total_forecast_sales } = response.data
      setPlotData(plot_data)
      setCsvData(csv_data)
      setTotalSales(total_forecast_sales)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data from the server')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(predictionPeriod)
  }, [predictionPeriod])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-xl'>
          <p className='text-white font-medium mb-2'>{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className='text-sm flex items-center gap-2'
              style={{ color: entry.color }}
            >
              <span
                className='w-2 h-2 rounded-full'
                style={{ backgroundColor: entry.color }}
              ></span>
              {`${entry.name}: ${entry.value?.toFixed(2) || 'N/A'}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const handleDownload = () => {
    const formats = {
      csv: downloadCSV,
      excel: downloadExcel,
      pdf: downloadPDF,
    }
    formats[downloadFormat]?.()
  }

  const downloadCSV = () => {
    const exportData = csvData.map((row) => ({
      Date: row.ds,
      Predicted: row.yhat.toFixed(2),
      'Lower Bound': row.yhat_lower.toFixed(2),
      'Upper Bound': row.yhat_upper.toFixed(2),
    }))
    const csv = Papa.unparse(exportData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'sales_prediction.csv')
  }

  const downloadExcel = () => {
    const exportData = csvData.map((row) => ({
      Date: row.ds,
      Predicted: row.yhat.toFixed(2),
      'Lower Bound': row.yhat_lower.toFixed(2),
      'Upper Bound': row.yhat_upper.toFixed(2),
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Prediction')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, 'sales_prediction.xlsx')
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.text('Sales Prediction Data', 20, 10)

    // Add chart as an SVG
    const chartContainer = document.querySelector('.recharts-wrapper')
    if (chartContainer) {
      const svgData = new XMLSerializer().serializeToString(
        chartContainer.querySelector('svg')
      )
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const imgData = canvas.toDataURL('image/png')
        doc.addImage(imgData, 'PNG', 15, 20, 180, 100)

        // Add table data after the chart
        const tableData = csvData.map((row) => [
          row.ds,
          row.yhat.toFixed(2),
          row.yhat_lower.toFixed(2),
          row.yhat_upper.toFixed(2),
        ])

        doc.autoTable({
          startY: 130,
          head: [['Date', 'Predicted', 'Lower Bound', 'Upper Bound']],
          body: tableData,
        })

        doc.save('sales_prediction.pdf')
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } else {
      const tableData = csvData.map((row) => [
        row.ds,
        row.yhat.toFixed(2),
        row.yhat_lower.toFixed(2),
        row.yhat_upper.toFixed(2),
      ])

      doc.autoTable({
        head: [['Date', 'Predicted', 'Lower Bound', 'Upper Bound']],
        body: tableData,
      })
      doc.save('sales_prediction.pdf')
    }
  }

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center p-4'>
        <motion.div
          className='text-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='flex justify-center items-center mb-4'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
          <h2 className='text-xl font-semibold text-white mb-2'>
            Processing Your Data
          </h2>
          <p className='text-gray-400'>Preparing your sales forecast...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center p-4'>
        <Card className='w-full max-w-lg bg-red-900/20 border-red-500/50'>
          <div className='p-6'>
            <h3 className='text-xl font-semibold text-red-500 mb-2'>
              Error Loading Data
            </h3>
            <p className='text-gray-300'>{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  const visibleRows = isTableExpanded ? csvData : csvData?.slice(0, 5)

  const formatPKR = (number) => {
    // Round to nearest whole number
    const roundedNumber = Math.round(number)
    const numStr = roundedNumber.toString()

    // Format from right to left, but preserve number order
    const result = numStr.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,')

    return `Rs ${result}`
  }

  return (
    <div className='relative flex-1 p-4 px-8'>
      <motion.div
        className='space-y-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Stats Cards */}
          <Card className='bg-gradient-to-br from-blue-600/20 to-purple-600/20'>
            <div className='p-6 flex items-start gap-4'>
              <TrendingUp className='w-8 h-8 text-blue-400 flex-shrink-0' />
              <div>
                <h3 className='text-lg text-gray-200 font-medium'>
                  Total Forecasted Sales
                </h3>
                <p className='text-2xl font-bold text-white mt-2'>
                  {formatPKR(totalSales || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className='bg-gradient-to-br from-purple-600/20 to-pink-600/20'>
            <div className='p-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <Calendar className='w-8 h-8 text-purple-400' />
                <h3 className='text-lg text-gray-200 font-medium'>
                  Forecast Period
                </h3>
              </div>
              <select
                value={predictionPeriod}
                onChange={(e) => setPredictionPeriod(e.target.value)}
                className='bg-gray-800/50 text-white py-2 px-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none'
              >
                <option value='6 months'>6 months</option>
                <option value='1 year'>1 Year</option>
                <option value='2 years'>2 Years</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <Card>
          <ChartCard>
            <ComposedChart data={plotData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis
                dataKey='date'
                stroke='#9CA3AF'
                tick={{ fill: '#9CA3AF' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke='#9CA3AF'
                tick={{ fill: '#9CA3AF' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type='monotone'
                dataKey='upper'
                fill='#3B82F6'
                stroke='none'
                fillOpacity={0.1}
                name='Upper Bound'
              />
              <Area
                type='monotone'
                dataKey='lower'
                fill='#3B82F6'
                stroke='none'
                fillOpacity={0.1}
                name='Lower Bound'
              />
              <Line
                type='monotone'
                dataKey='predicted'
                stroke='#F1C232'
                strokeWidth={2}
                dot={false}
                name='Predicted'
              />
            </ComposedChart>
          </ChartCard>
        </Card>

        {/* Data Table Card */}
        <Card>
          <div className='p-6'>
            <div className='flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4'>
              <h3 className='text-xl text-white font-semibold'>
                Forecast Data
              </h3>
              <div className='flex items-center gap-4'>
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  className='bg-gray-700 text-white py-2 px-4 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                >
                  <option value='csv'>CSV</option>
                  <option value='excel'>Excel</option>
                  <option value='pdf'>PDF</option>
                </select>
                <button
                  onClick={handleDownload}
                  className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300'
                >
                  <Download className='w-4 h-4' />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-gray-300'>
                <thead>
                  <tr className='bg-gray-700/50'>
                    <th className='px-4 py-3 rounded-tl-lg'>Date</th>
                    <th className='px-4 py-3'>Predicted</th>
                    <th className='px-4 py-3'>Lower Bound</th>
                    <th className='px-4 py-3 rounded-tr-lg'>Upper Bound</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows?.map((row, index) => (
                    <tr
                      key={index}
                      className='border-b border-gray-700 hover:bg-gray-700/30 transition-colors'
                    >
                      <td className='px-4 py-3'>{row.ds}</td>
                      <td className='px-4 py-3'>{row.yhat.toFixed(2)}</td>
                      <td className='px-4 py-3'>{row.yhat_lower.toFixed(2)}</td>
                      <td className='px-4 py-3'>{row.yhat_upper.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='mt-4 flex justify-center'>
              <button
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className='flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300'
              >
                {isTableExpanded ? (
                  <>
                    Show Less <ChevronUp className='w-4 h-4' />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className='w-4 h-4' />
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default SalesPrediction
