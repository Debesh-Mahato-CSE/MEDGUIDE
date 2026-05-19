import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaUsers, FaUserMd, FaCalendar, FaPills, 
  FaMoneyBill, FaStar, FaChartLine, FaCheckCircle 
} from 'react-icons/fa'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatsCard from '../../components/common/StatsCard'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [registrationTrends, setRegistrationTrends] = useState<any[]>([])
  const [appointmentTrends, setAppointmentTrends] = useState<any[]>([])
  const [topSpecializations, setTopSpecializations] = useState<any[]>([])
  const [topDoctors, setTopDoctors] = useState<any[]>([])
  const [revenueStats, setRevenueStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const COLORS = ['#667eea', '#764ba2', '#f472b6', '#34d399', '#fbbf24', '#f87171']

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      setStats(response.data.stats)
      setRegistrationTrends(response.data.registrationTrends || [])
      setAppointmentTrends(response.data.appointmentTrends || [])
      setTopSpecializations(response.data.topSpecializations || [])
      setTopDoctors(response.data.topDoctors || [])
      setRevenueStats(response.data.revenueStats)
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
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and analytics</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Patients"
            value={stats?.total_patients || 0}
            icon={FaUsers}
            color="bg-blue-500"
          />
          <StatsCard
            title="Total Doctors"
            value={stats?.total_doctors || 0}
            icon={FaUserMd}
            color="bg-green-500"
          />
          <StatsCard
            title="Pending Verification"
            value={stats?.pending_doctors || 0}
            icon={FaCheckCircle}
            color="bg-yellow-500"
          />
          <StatsCard
            title="Total Appointments"
            value={stats?.total_appointments || 0}
            icon={FaCalendar}
            color="bg-purple-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Today's Appointments"
            value={stats?.today_appointments || 0}
            icon={FaCalendar}
            color="bg-indigo-500"
          />
          <StatsCard
            title="Total Medicines"
            value={stats?.total_medicines || 0}
            icon={FaPills}
            color="bg-pink-500"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${revenueStats?.total_revenue || 0}`}
            icon={FaMoneyBill}
            color="bg-emerald-500"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`₹${revenueStats?.monthly_revenue || 0}`}
            icon={FaChartLine}
            color="bg-orange-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Appointment Trends Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Appointment Trends (Last 30 Days)</h2>
            {appointmentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    dot={{ fill: '#667eea' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">No data available</p>
            )}
          </div>

          {/* Top Specializations Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Top Specializations</h2>
            {topSpecializations.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topSpecializations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ specialization, percent }) => 
                      `${specialization} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="appointment_count"
                    nameKey="specialization"
                  >
                    {topSpecializations.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">No data available</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Registration Trends */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Registration Trends</h2>
            {registrationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={registrationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#667eea" name="New Registrations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">No data available</p>
            )}
          </div>

          {/* Top Doctors */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Top Doctors</h2>
            {topDoctors.length > 0 ? (
              <div className="space-y-4">
                {topDoctors.slice(0, 5).map((doctor, index) => (
                  <div key={doctor.id} className="flex items-center space-x-4">
                    <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <img
                      src={doctor.profile_photo || 'https://via.placeholder.com/40'}
                      alt={doctor.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{doctor.full_name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="font-semibold">
                          {doctor.avg_rating ? Number(doctor.avg_rating).toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{doctor.appointment_count} appointments</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/doctors" className="card text-center card-hover cursor-pointer">
              <FaUserMd className="mx-auto text-green-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">Verify Doctors</p>
              {stats?.pending_doctors > 0 && (
                <span className="badge badge-warning mt-2">{stats.pending_doctors} Pending</span>
              )}
            </Link>
            <Link to="/admin/users" className="card text-center card-hover cursor-pointer">
              <FaUsers className="mx-auto text-blue-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">Manage Users</p>
            </Link>
            <Link to="/admin/medicines" className="card text-center card-hover cursor-pointer">
              <FaPills className="mx-auto text-purple-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">Manage Medicines</p>
            </Link>
            <Link to="/admin/analytics" className="card text-center card-hover cursor-pointer">
              <FaChartLine className="mx-auto text-orange-500 mb-3" size={32} />
              <p className="font-semibold text-gray-800">View Analytics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard