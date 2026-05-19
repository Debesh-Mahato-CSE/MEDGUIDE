import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUserMd, FaCheck, FaTimes, FaEye, FaSearch } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatDate } from '../../utils/helpers'

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<any[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, statusFilter])

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors/pending')
      setDoctors(response.data.doctors)
    } catch (error) {
      toast.error('Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.verification_status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredDoctors(filtered)
  }

  const handleVerify = async (doctorId: number, status: 'verified' | 'rejected') => {
    try {
      await api.put(`/admin/doctors/${doctorId}/verify`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined
      })
      toast.success(`Doctor ${status} successfully`)
      setShowDetailModal(false)
      setRejectionReason('')
      fetchDoctors()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify doctor')
    }
  }

  const viewDetails = (doctor: any) => {
    setSelectedDoctor(doctor)
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
          <h1 className="text-3xl font-bold text-gray-800">Doctor Verification</h1>
          <p className="text-gray-600 mt-2">Review and verify doctor registrations</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
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
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('pending')
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Doctors List */}
        {filteredDoctors.length > 0 ? (
          <div className="grid gap-6">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start space-x-4 mb-4 md:mb-0 flex-1">
                    <img
                      src={doctor.profile_photo || 'https://via.placeholder.com/80'}
                      alt={doctor.full_name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">Dr. {doctor.full_name}</h3>
                      <p className="text-gray-600">{doctor.specialization}</p>
                      <p className="text-sm text-gray-600">{doctor.qualification}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                        <span>📧 {doctor.email}</span>
                        <span>📱 {doctor.phone}</span>
                        <span>🏥 {doctor.clinic_name}</span>
                      </div>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`badge ${
                          doctor.verification_status === 'verified' ? 'badge-success' :
                          doctor.verification_status === 'rejected' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {doctor.verification_status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Registered: {formatDate(doctor.registration_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 md:ml-4">
                    <button
                      onClick={() => viewDetails(doctor)}
                      className="btn-outline flex items-center justify-center space-x-2"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>
                    {doctor.verification_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(doctor.id, 'verified')}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center space-x-2"
                        >
                          <FaCheck />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor)
                            setShowDetailModal(true)
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
                        >
                          <FaTimes />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaUserMd className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
            <p className="text-gray-500">No pending verifications at this time</p>
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setRejectionReason('')
          }}
          title="Doctor Verification Details"
          size="lg"
        >
          {selectedDoctor && (
            <div className="space-y-6">
              {/* Doctor Info */}
              <div className="flex items-center space-x-4 pb-6 border-b">
                <img
                  src={selectedDoctor.profile_photo || 'https://via.placeholder.com/100'}
                  alt={selectedDoctor.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Dr. {selectedDoctor.full_name}</h3>
                  <p className="text-gray-600">{selectedDoctor.specialization}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.email}</p>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Professional Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Qualification</p>
                    <p className="font-semibold text-gray-800">{selectedDoctor.qualification}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-semibold text-gray-800">{selectedDoctor.experience} years</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="font-semibold text-gray-800">{selectedDoctor.license_number}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Medical Council</p>
                    <p className="font-semibold text-gray-800">{selectedDoctor.medical_council}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="font-semibold text-gray-800">₹{selectedDoctor.consultation_fee}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="font-semibold text-gray-800">{selectedDoctor.languages || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Clinic Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Clinic Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">{selectedDoctor.clinic_name}</p>
                  <p className="text-gray-700">{selectedDoctor.clinic_address}</p>
                  <p className="text-gray-700">
                    {selectedDoctor.city}, {selectedDoctor.state} - {selectedDoctor.pincode}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Documents</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedDoctor.license_document && (
                    <a
                      href={selectedDoctor.license_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-center"
                    >
                      View License Document
                    </a>
                  )}
                  {selectedDoctor.degree_document && (
                    <a
                      href={selectedDoctor.degree_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-center"
                    >
                      View Degree Certificate
                    </a>
                  )}
                </div>
              </div>

              {/* Bio */}
              {selectedDoctor.bio && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">About</h4>
                  <p className="text-gray-700">{selectedDoctor.bio}</p>
                </div>
              )}

              {/* Actions */}
              {selectedDoctor.verification_status === 'pending' && (
                <div className="pt-6 border-t">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        if (rejectionReason.trim()) {
                          handleVerify(selectedDoctor.id, 'rejected')
                        } else {
                          toast.error('Please provide a rejection reason')
                        }
                      }}
                      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(selectedDoctor.id, 'verified')}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Verify & Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default AdminDoctors