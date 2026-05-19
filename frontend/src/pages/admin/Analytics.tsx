import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { FaDownload } from 'react-icons/fa'
import api from '../../utils/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminAnalytics = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const COLORS = ['#667eea', '#764ba2', '#f472b6', '#34d399', '#fbbf24']

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics')
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">Detailed insights and statistics</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Growth */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">User Growth (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.registrationTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#667eea" name="New Users" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Appointment Status Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Appointment Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats?.stats?.total_appointments || 0 },
                    { name: 'Pending', value: stats?.stats?.pending_appointments || 0 },
                    { name: 'Today', value: stats?.stats?.today_appointments || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Specialization Popularity */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Top Specializations by Appointments</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.topSpecializations || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="specialization" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointment_count" fill="#667eea" name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trend */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Overview</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{stats?.revenueStats?.total_revenue || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-700">
                  ₹{stats?.revenueStats?.monthly_revenue || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Daily Revenue</p>
                <p className="text-2xl font-bold text-purple-700">
                  ₹{stats?.revenueStats?.daily_revenue || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">System Summary</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600 mb-2">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">
                {(stats?.stats?.total_patients || 0) + (stats?.stats?.total_doctors || 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Active Doctors</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.stats?.verified_doctors || 0}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.stats?.total_appointments || 0}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Average Rating</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats?.stats?.avg_rating ? Number(stats.stats.avg_rating).toFixed(1) : 'N/A'}⭐
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics