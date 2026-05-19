import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaCalendarCheck, 
  FaPrescription, 
  FaFileAlt, 
  FaClock,
  FaUserMd,
  FaChartLine
} from 'react-icons/fa'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatsCard from '../../components/common/StatsCard'
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers'

const PatientDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/patients/dashboard/stats')
      setStats(response.data.stats)
      setUpcomingAppointments(response.data.upcomingAppointments || [])
      setRecentPrescriptions(response.data.recentPrescriptions || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your health overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Pending Appointments"
            value={stats?.pending_appointments || 0}
            icon={FaClock}
            color="bg-yellow-500"
          />
          <StatsCard
            title="Upcoming Appointments"
            value={stats?.upcoming_appointments || 0}
            icon={FaCalendarCheck}
            color="bg-blue-500"
          />
          <StatsCard
            title="Total Prescriptions"
            value={stats?.total_prescriptions || 0}
            icon={FaPrescription}
            color="bg-green-500"
          />
          <StatsCard
            title="Medical Reports"
            value={stats?.total_reports || 0}
            icon={FaFileAlt}
            color="bg-purple-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={appointment.doctor_photo || 'https://via.placeholder.com/50'}
                        alt={appointment.doctor_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">Dr. {appointment.doctor_name}</h3>
                        <p className="text-sm text-gray-600">{appointment.specialization}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>📅 {formatDate(appointment.appointment_date)}</span>
                          <span>🕐 {formatTime(appointment.appointment_time)}</span>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaCalendarCheck className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link to="/doctors" className="btn-primary mt-4 inline-block">
                  Book Appointment
                </Link>
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Prescriptions</h2>
              <Link to="/patient/prescriptions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {recentPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {recentPrescriptions.map((prescription) => (
                  <motion.div
                    key={prescription.id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaPrescription className="text-primary-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">Dr. {prescription.doctor_name}</h3>
                        <p className="text-sm text-gray-600">{prescription.diagnosis || 'General Prescription'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(prescription.created_at)}
                        </p>
                      </div>
                      <Link
                        to={`/patient/prescriptions`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaPrescription className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">No prescriptions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/doctors" className="card text-center card-hover cursor-pointer">
              <FaUserMd className="mx-auto text-primary-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">Find Doctors</p>
            </Link>
            <Link to="/patient/appointments" className="card text-center card-hover cursor-pointer">
              <FaCalendarCheck className="mx-auto text-blue-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">My Appointments</p>
            </Link>
            <Link to="/patient/prescriptions" className="card text-center card-hover cursor-pointer">
              <FaPrescription className="mx-auto text-green-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">Prescriptions</p>
            </Link>
            <Link to="/patient/timeline" className="card text-center card-hover cursor-pointer">
              <FaChartLine className="mx-auto text-purple-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">Medical Timeline</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard