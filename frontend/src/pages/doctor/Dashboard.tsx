import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCalendar, FaUser, FaStar, FaMoneyBill, FaClock, FaCheckCircle } from 'react-icons/fa'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatsCard from '../../components/common/StatsCard'
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DoctorDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/doctors/dashboard/stats')
      setStats(response.data.stats)
      setRecentAppointments(response.data.recentAppointments || [])
      setTrends(response.data.trends || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data')
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your practice overview</p>
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
            title="Today's Appointments"
            value={stats?.today_appointments || 0}
            icon={FaCalendar}
            color="bg-blue-500"
          />
          <StatsCard
            title="Total Patients"
            value={stats?.total_patients || 0}
            icon={FaUser}
            color="bg-green-500"
          />
          <StatsCard
            title="Monthly Earnings"
            value={`₹${stats?.monthly_earnings || 0}`}
            icon={FaMoneyBill}
            color="bg-purple-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
              <Link to="/doctor/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={appointment.patient_photo || 'https://via.placeholder.com/50'}
                        alt={appointment.patient_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{appointment.patient_name}</h3>
                        <p className="text-sm text-gray-600">{appointment.reason}</p>
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
              <p className="text-center text-gray-500 py-8">No recent appointments</p>
            )}
          </div>

          {/* Appointment Trends */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Appointment Trends (Last 7 Days)</h2>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No trend data available</p>
            )}
          </div>
        </div>

        {/* Rating Overview */}
        <div className="card mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Rating Overview</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-2" size={32} />
                  <span className="text-4xl font-bold text-gray-800">
                    {stats?.avg_rating ? Number(stats.avg_rating).toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="text-gray-600">
                  <p className="font-semibold">{stats?.total_reviews || 0} Reviews</p>
                  <p className="text-sm">Based on patient feedback</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{stats?.total_appointments || 0}</p>
              <p className="text-sm text-gray-600">Total Consultations</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/doctor/appointments" className="card text-center card-hover cursor-pointer">
              <FaCalendar className="mx-auto text-blue-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">View Appointments</p>
            </Link>
            <Link to="/doctor/patients" className="card text-center card-hover cursor-pointer">
              <FaUser className="mx-auto text-green-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">My Patients</p>
            </Link>
            <Link to="/doctor/profile" className="card text-center card-hover cursor-pointer">
              <FaCheckCircle className="mx-auto text-purple-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">Edit Profile</p>
            </Link>
            <div className="card text-center cursor-pointer bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
              <FaStar className="mx-auto mb-3" size={32} />
              <p className="font-semibold">Premium Features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard