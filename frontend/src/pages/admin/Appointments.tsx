import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendar, FaSearch, FaEye } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers'

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchQuery, statusFilter, dateFilter])

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/admin/appointments')
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

    if (dateFilter) {
      filtered = filtered.filter(apt => apt.appointment_date === dateFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appointment_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredAppointments(filtered)
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
          <h1 className="text-3xl font-bold text-gray-800">Appointments Management</h1>
          <p className="text-gray-600 mt-2">Monitor all appointments in the system</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
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
                setSearchQuery('')
                setStatusFilter('all')
                setDateFilter('')
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Appointment #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <motion.tr
                    key={appointment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="font-mono text-sm">{appointment.appointment_number}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {appointment.patient_name?.charAt(0)}
                        </div>
                        <span className="font-medium">{appointment.patient_name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">Dr. {appointment.doctor_name}</p>
                        <p className="text-xs text-gray-600">{appointment.specialization}</p>
                      </div>
                    </td>
                    <td className="text-sm">
                      <div>{formatDate(appointment.appointment_date)}</div>
                      <div className="text-gray-600">{formatTime(appointment.appointment_time)}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="font-semibold">₹{appointment.consultation_fee}</td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowDetailModal(true)
                        }}
                        className="p-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 transition"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <FaCalendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No appointments found</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Appointment Details"
          size="lg"
        >
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Patient Information</h4>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedAppointment.patient_name}</p>
                    <p><strong>Email:</strong> {selectedAppointment.patient_email}</p>
                    <p><strong>Phone:</strong> {selectedAppointment.patient_phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Doctor Information</h4>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> Dr. {selectedAppointment.doctor_name}</p>
                    <p><strong>Specialization:</strong> {selectedAppointment.specialization}</p>
                    <p><strong>Clinic:</strong> {selectedAppointment.clinic_name}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Appointment Number</p>
                  <p className="font-semibold text-gray-800">{selectedAppointment.appointment_number}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.appointment_time)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`badge ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="font-semibold text-gray-800">₹{selectedAppointment.consultation_fee}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Reason for Visit</h4>
                <p className="text-gray-700">{selectedAppointment.reason}</p>
              </div>

              {selectedAppointment.symptoms && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Symptoms</h4>
                  <p className="text-gray-700">{selectedAppointment.symptoms}</p>
                </div>
              )}

              {selectedAppointment.consultation_notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Consultation Notes</h4>
                  <p className="text-gray-700">{selectedAppointment.consultation_notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default AdminAppointments