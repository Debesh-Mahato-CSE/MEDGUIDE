import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendar, FaPrescription, FaFileAlt, FaStethoscope } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const PatientTimeline = () => {
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTimeline()
  }, [])

  const fetchTimeline = async () => {
    try {
      const response = await api.get('/patients/timeline')
      setTimeline(response.data.timeline)
    } catch (error) {
      toast.error('Failed to fetch medical timeline')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <FaCalendar className="text-blue-500" size={24} />
      case 'prescription':
        return <FaPrescription className="text-green-500" size={24} />
      case 'report':
        return <FaFileAlt className="text-purple-500" size={24} />
      default:
        return <FaStethoscope className="text-gray-500" size={24} />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'border-blue-500 bg-blue-50'
      case 'prescription':
        return 'border-green-500 bg-green-50'
      case 'report':
        return 'border-purple-500 bg-purple-50'
      default:
        return 'border-gray-500 bg-gray-50'
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Medical Timeline</h1>
          <p className="text-gray-600 mt-2">Your complete health history at a glance</p>
        </div>

        {timeline.length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Icon */}
                  <div className="absolute left-0 w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg">
                    {getIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className={`card ${getColor(item.type)} border-l-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 capitalize">
                        {item.type}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    {item.type === 'appointment' && (
                      <div>
                        <p className="text-gray-700">
                          <strong>Doctor:</strong> Dr. {item.doctor_name}
                        </p>
                        <p className="text-gray-700">
                          <strong>Specialization:</strong> {item.specialization}
                        </p>
                        <p className="text-gray-700">
                          <strong>Reason:</strong> {item.reason}
                        </p>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </div>
                    )}

                    {item.type === 'prescription' && (
                      <div>
                        <p className="text-gray-700">
                          <strong>Doctor:</strong> Dr. {item.doctor_name}
                        </p>
                        {item.diagnosis && (
                          <p className="text-gray-700">
                            <strong>Diagnosis:</strong> {item.diagnosis}
                          </p>
                        )}
                      </div>
                    )}

                    {item.type === 'report' && (
                      <div>
                        <p className="text-gray-700">
                          <strong>Type:</strong> {item.report_type}
                        </p>
                        <p className="text-gray-700">
                          <strong>Report:</strong> {item.report_name}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaStethoscope className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No medical history yet</h3>
            <p className="text-gray-500">Your medical timeline will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientTimeline