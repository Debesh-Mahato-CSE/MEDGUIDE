import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUpload, FaFileAlt, FaDownload, FaTrash, FaEye } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatDate } from '../../utils/helpers'

const PatientReports = () => {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    reportType: '',
    reportName: '',
    description: '',
    reportDate: '',
    file: null as File | null
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/list')
      setReports(response.data.reports)
    } catch (error) {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] })
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadData.file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('reports', uploadData.file)
      formData.append('reportType', uploadData.reportType)
      formData.append('reportName', uploadData.reportName)
      formData.append('description', uploadData.description)
      formData.append('reportDate', uploadData.reportDate)

      await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Report uploaded successfully')
      setShowUploadModal(false)
      setUploadData({ reportType: '', reportName: '', description: '', reportDate: '', file: null })
      fetchReports()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload report')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    try {
      await api.delete(`/reports/${id}`)
      toast.success('Report deleted successfully')
      fetchReports()
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Medical Reports</h1>
            <p className="text-gray-600 mt-2">Upload and manage your medical documents</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FaUpload />
            <span>Upload Report</span>
          </button>
        </div>

        {reports.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaFileAlt className="text-blue-600" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{report.report_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{report.report_type}</p>
                    {report.description && (
                      <p className="text-xs text-gray-500 mb-2">{report.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Report Date: {formatDate(report.report_date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {formatDate(report.upload_date)}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <a
                    href={report.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-outline text-center text-sm flex items-center justify-center space-x-1"
                  >
                    <FaEye />
                    <span>View</span>
                  </a>
                  <a
                    href={report.file_path}
                    download
                    className="flex-1 btn-primary text-center text-sm flex items-center justify-center space-x-1"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaFileAlt className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No reports uploaded yet</h3>
            <p className="text-gray-500 mb-6">Start uploading your medical reports for easy access</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary inline-block"
            >
              Upload First Report
            </button>
          </div>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload Medical Report"
          size="md"
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type *
              </label>
              <select
                value={uploadData.reportType}
                onChange={(e) => setUploadData({ ...uploadData, reportType: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Type</option>
                <option value="Blood Test">Blood Test</option>
                <option value="X-Ray">X-Ray</option>
                <option value="MRI">MRI</option>
                <option value="CT Scan">CT Scan</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="ECG">ECG</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name *
              </label>
              <input
                type="text"
                value={uploadData.reportName}
                onChange={(e) => setUploadData({ ...uploadData, reportName: e.target.value })}
                className="input-field"
                placeholder="e.g., Complete Blood Count"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Date *
              </label>
              <input
                type="date"
                value={uploadData.reportDate}
                onChange={(e) => setUploadData({ ...uploadData, reportDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File * (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="input-field"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary"
              >
                {uploading ? (
                  <div className="spinner w-5 h-5 border-2"></div>
                ) : (
                  'Upload Report'
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default PatientReports