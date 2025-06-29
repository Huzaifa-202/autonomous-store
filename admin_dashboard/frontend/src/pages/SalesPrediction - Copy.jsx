import axios from 'axios'
import { saveAs } from 'file-saver'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { ChevronDown } from 'lucide-react'
import Papa from 'papaparse'
import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import Header from '../components/common/Header'

const SalesPrediction = () => {
  const [csvData, setCsvData] = useState(null)
  const [plotImageUrl, setPlotImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [predictionPeriod, setPredictionPeriod] = useState('1 year')
  const [downloadFormat, setDownloadFormat] = useState('csv')
  const [totalSales, setTotalSales] = useState(null)

  const fetchData = async (period) => {
    try {
      setLoading(true)
      const response = await axios.get(
        `http://localhost:8080/forecast/${period}`
      )
      console.log(response)
      const { csv_file_url, plot_image_url, total_forecast_sales } =
        response.data

      // Set total forecast sales and plot image
      setPlotImageUrl(plot_image_url)
      setTotalSales(total_forecast_sales)

      // Fetch CSV file and parse it
      const csvDataResponse = await axios.get(csv_file_url, {
        responseType: 'blob',
      })

      const csvBlob = csvDataResponse.data
      Papa.parse(csvBlob, {
        complete: (result) => {
          setCsvData(result.data)
          setLoading(false)
        },
        header: true,
        error: (err) => {
          console.error('Error parsing CSV:', err)
          setError('Error parsing CSV data')
          setLoading(false)
        },
      })
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data from the server')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(predictionPeriod)
  }, [predictionPeriod])

  const handlePeriodChange = (e) => {
    setPredictionPeriod(e.target.value)
  }

  const handleDownload = () => {
    if (downloadFormat === 'csv') {
      downloadCSV()
    } else if (downloadFormat === 'excel') {
      downloadExcel()
    } else if (downloadFormat === 'pdf') {
      downloadPDF()
    }
  }

  const downloadCSV = () => {
    const csvWithGraphLink = csvData.map((row) => ({
      ...row,
      'Graph Link': plotImageUrl, // Add the graph link as the last column
    }))
    const csv = Papa.unparse(csvWithGraphLink)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'sales_prediction.csv')
  }

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      csvData.map((row) => ({
        ...row,
        'Graph Link': plotImageUrl, // Add the graph link as the last column
      }))
    )
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

    // Add graph image at the top
    if (plotImageUrl) {
      const img = new Image()
      img.src = plotImageUrl
      img.onload = () => {
        doc.addImage(img, 'PNG', 15, 20, 180, 100) // Adjust dimensions as needed

        // Add table data after the image
        doc.autoTable({
          startY: 130, // Adjust position below the image
          head: [Object.keys(csvData[0])],
          body: csvData.map((row) => Object.values(row)),
        })

        doc.save('sales_prediction.pdf')
      }
    } else {
      // If no image, just add table data
      doc.autoTable({
        head: [Object.keys(csvData[0])],
        body: csvData.map((row) => Object.values(row)),
      })
      doc.save('sales_prediction.pdf')
    }
  }

  if (loading) {
    return (
      <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
        <Header title='Sales Prediction' />
        <motion.div
          className='flex items-center justify-center min-h-screen'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className='text-center'>
            <div className='flex justify-center items-center mb-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
            <h2 className='text-xl font-semibold text-white'>
              Loading data, please wait...
            </h2>
            <p className='text-gray-400 mt-2'>This may take a moment.</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
        <Header title='Sales Prediction' />
        <motion.div
          className='flex items-center justify-center min-h-screen text-red-500'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h2>{error}</h2>
        </motion.div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title='Sales Prediction' />
      <motion.div
        className='container mx-auto mt-10 px-4'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Display Total Forecasted Sales */}
        {totalSales && (
          <div className='bg-gray-800 text-white p-4 rounded-lg mb-6'>
            <h2 className='text-xl font-semibold'>Total Forecasted Sales:</h2>
            <p className='text-lg'>${totalSales.toFixed(2)}</p>{' '}
            {/* Display total sales */}
          </div>
        )}

        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-white'>Graph</h1>
          <div className='relative'>
            <select
              value={predictionPeriod}
              onChange={handlePeriodChange}
              className='appearance-none bg-gray-700 text-white py-2 px-4 pr              pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500'
            >
              <option value='6 months'>6 month</option>
              <option value='1year'>1 Year</option>
              <option value='2 year'>2 Years</option>
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
              <ChevronDown />
            </div>
          </div>
        </div>

        {/* Display Plot Image */}
        {plotImageUrl && (
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-white mb-2'>
              Sales Forecast Graph
            </h2>
            <img
              src={plotImageUrl}
              alt='Sales Forecast Graph'
              className='w-full h-auto rounded-lg'
            />
          </div>
        )}

        {/* Display CSV Data */}
        {csvData && (
          <div className='bg-gray-800 p-6 rounded-lg'>
            <h2 className='text-xl font-semibold text-white mb-4'>
              Sales Forecast Data
            </h2>
            <div className='overflow-x-auto'>
              <table className='table-auto w-full text-left text-gray-300'>
                <thead>
                  <tr className='bg-gray-700'>
                    {Object.keys(csvData[0]).map((key) => (
                      <th key={key} className='px-4 py-2'>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, index) => (
                    <tr key={index} className='bg-gray-800'>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx} className='border px-4 py-2'>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Download Options */}
        <div className='flex items-center justify-between mt-6'>
          <div className='flex items-center space-x-4'>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              className='bg-gray-700 text-white py-2 px-4 rounded-lg focus:outline-none'
            >
              <option value='csv'>Download as CSV</option>
              <option value='excel'>Download as Excel</option>
              <option value='pdf'>Download as PDF</option>
            </select>
            <button
              onClick={handleDownload}
              className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg'
            >
              Download
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SalesPrediction
