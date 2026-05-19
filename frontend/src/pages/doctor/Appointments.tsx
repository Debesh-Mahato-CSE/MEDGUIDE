import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendar, FaSearch, FaCheck, FaTimes, FaEye } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers'

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [consultationNotes, setConsultationNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, statusFilter, searchQuery, dateFilter])

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/doctors/appointments/list')
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
        apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (dateFilter) {
      filtered = filtered.filter(apt => apt.appointment_date === dateFilter)
    }

    setFilteredAppointments(filtered)
  }

  const handleUpdateStatus = async (id: number, status: string, reason?: string) => {
    try {
      await api.put(`/appointments/${id}/status`, {
        status,
        rejectionReason: reason,
        consultationNotes: status === 'completed' ? consultationNotes : undefined
      })
      toast.success(`Appointment ${status} successfully`)
      fetchAppointments()
      setShowDetailModal(false)
      setShowNotesModal(false)
      setConsultationNotes('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update appointment')
    }
  }

  const handleAccept = (appointment: any) => {
    if (window.confirm(`Accept appointment with ${appointment.patient_name}?`)) {
      handleUpdateStatus(appointment.id, 'accepted')
    }
  }

  const handleReject = (appointment: any) => {
    const reason = window.prompt('Please provide a reason for rejection:')
    if (reason) {
      handleUpdateStatus(appointment.id, 'rejected', reason)
    }
  }

  const handleComplete = (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowNotesModal(true)
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
          <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your patient appointments</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
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
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            />
            <button
              onClick={() => {
                setStatusFilter('all')
                setSearchQuery('')
                setDateFilter('')
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
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
                  <div className="flex items-start space-x-4 mb-4 md:mb-0 flex-1">
                    <img
                      src={appointment.patient_photo || 'https://via.placeholder.com/80'}
                      alt={appointment.patient_name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{appointment.patient_name}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaCalendar className="mr-2" />
                          {formatDate(appointment.appointment_date)}
                        </span>
                        <span>🕐 {formatTime(appointment.appointment_time)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        {appointment.priority !== 'normal' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.priority)}`}>
                            {appointment.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                      {appointment.patient_age && (
                        <p className="text-sm text-gray-600 mt-1">
                          Age: {appointment.patient_age} | Gender: {appointment.patient_gender} | Blood Group: {appointment.patient_blood_group}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 md:ml-4">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowDetailModal(true)
                      }}
                      className="btn-outline flex items-center justify-center space-x-2"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(appointment)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center space-x-2"
                        >
                          <FaCheck />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(appointment)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
                        >
                          <FaTimes />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    {appointment.status === 'accepted' && (
                      <button
                        onClick={() => handleComplete(appointment)}
                        className="btn-primary flex items-center justify-center space-x-2"
                      >
                        <FaCheck />
                        <span>Mark Complete</span>
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
            <p className="text-gray-500">Appointments will appear here once patients book</p>
          </div>
        )}

        {/* Detail Modal */}
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
                  src={selectedAppointment.patient_photo || 'https://via.placeholder.com/80'}
                  alt={selectedAppointment.patient_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedAppointment.patient_name}</h3>
                  <p className="text-gray-600">{selectedAppointment.patient_email}</p>
                  <p className="text-gray-600">{selectedAppointment.patient_phone}</p>
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
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold text-gray-800">{selectedAppointment.patient_age} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold text-gray-800">{selectedAppointment.patient_gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-semibold text-gray-800">{selectedAppointment.patient_blood_group || 'N/A'}</p>
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

              {selectedAppointment.patient_allergies && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Allergies</p>
                  <p className="text-red-700">{selectedAppointment.patient_allergies}</p>
                </div>
              )}

              {selectedAppointment.patient_existing_diseases && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Medical History</p>
                  <p className="text-yellow-700">{selectedAppointment.patient_existing_diseases}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Consultation Notes Modal */}
        <Modal
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          title="Complete Consultation"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Notes
              </label>
              <textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="input-field"
                rows={6}
                placeholder="Enter consultation notes, diagnosis, recommendations..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedAppointment && handleUpdateStatus(selectedAppointment.id, 'completed')}
                className="btn-primary"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default DoctorAppointments