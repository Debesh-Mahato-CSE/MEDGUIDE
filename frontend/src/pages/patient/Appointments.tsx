import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCalendar, FaSearch, FaEye, FaTimes } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers'

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, statusFilter, searchQuery])

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/patients/appointments/list')
      setAppointments(response.data.appointments)
    } catch (error) {
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredAppointments(filtered)
  }

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return

    try {
      await api.put(`/appointments/${id}/cancel`, {
        cancellationReason: 'Cancelled by patient'
      })
      toast.success('Appointment cancelled successfully')
      fetchAppointments()
      setShowDetailModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment')
    }
  }

  const viewDetails = (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
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
          <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-600 mt-2">Manage all your appointments</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="grid gap-6">
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start space-x-4 mb-4 md:mb-0">
                    <img
                      src={appointment.doctor_photo || 'https://via.placeholder.com/80'}
                      alt={appointment.doctor_name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Dr. {appointment.doctor_name}
                      </h3>
                      <p className="text-gray-600">{appointment.specialization}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FaCalendar className="mr-2" />
                          {formatDate(appointment.appointment_date)}
                        </span>
                        <span>🕐 {formatTime(appointment.appointment_time)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => viewDetails(appointment)}
                      className="btn-outline flex items-center justify-center space-x-2"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
                      >
                        <FaTimes />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaCalendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">Start booking appointments with our verified doctors</p>
            <Link to="/doctors" className="btn-primary inline-block">
              Find Doctors
            </Link>
          </div>
        )}

        {/* Appointment Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Appointment Details"
          size="lg"
        >
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 pb-6 border-b">
                <img
                  src={selectedAppointment.doctor_photo || 'https://via.placeholder.com/80'}
                  alt={selectedAppointment.doctor_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Dr. {selectedAppointment.doctor_name}
                  </h3>
                  <p className="text-gray-600">{selectedAppointment.specialization}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Appointment Number</p>
                  <p className="font-semibold text-gray-800">{selectedAppointment.appointment_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.appointment_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="font-semibold text-gray-800">₹{selectedAppointment.consultation_fee}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAppointment.priority)}`}>
                    {selectedAppointment.priority}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Reason for Visit</p>
                <p className="text-gray-800">{selectedAppointment.reason}</p>
              </div>

              {selectedAppointment.symptoms && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Symptoms</p>
                  <p className="text-gray-800">{selectedAppointment.symptoms}</p>
                </div>
              )}

              {selectedAppointment.consultation_notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Doctor's Notes</p>
                  <p className="text-gray-800">{selectedAppointment.consultation_notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">Clinic Details</p>
                <p className="text-gray-800">{selectedAppointment.clinic_name}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.clinic_address}</p>
              </div>

              {selectedAppointment.status === 'pending' && (
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default PatientAppointments