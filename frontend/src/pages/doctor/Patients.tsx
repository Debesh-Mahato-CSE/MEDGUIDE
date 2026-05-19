import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaSearch, FaEye, FaFileAlt } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatDate } from '../../utils/helpers'

const DoctorPatients = () => {
  const [patients, setPatients] = useState<any[]>([])
  const [filteredPatients, setFilteredPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [patientHistory, setPatientHistory] = useState<any[]>([])

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [patients, searchQuery])

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctors/appointments/list?status=completed')
      // Extract unique patients
      const appointmentsData = response.data.appointments || []
      const uniquePatients = appointmentsData.reduce((acc: any[], apt: any) => {
        const exists = acc.find(p => p.patient_id === apt.patient_id)
        if (!exists) {
          acc.push({
            patient_id: apt.patient_id,
            patient_name: apt.patient_name,
            patient_email: apt.patient_email,
            patient_phone: apt.patient_phone,
            patient_photo: apt.patient_photo,
            patient_age: apt.patient_age,
            patient_gender: apt.patient_gender,
            patient_blood_group: apt.patient_blood_group,
            last_visit: apt.appointment_date,
            total_visits: appointmentsData.filter((a: any) => a.patient_id === apt.patient_id).length
          })
        }
        return acc
      }, [])
      setPatients(uniquePatients)
    } catch (error) {
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const filterPatients = () => {
    if (!searchQuery) {
      setFilteredPatients(patients)
      return
    }

    const filtered = patients.filter(patient =>
      patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient_phone?.includes(searchQuery)
    )
    setFilteredPatients(filtered)
  }

  const viewPatientDetails = async (patient: any) => {
    setSelectedPatient(patient)
    try {
      const response = await api.get(`/doctors/appointments/list?status=completed`)
      const history = response.data.appointments.filter(
        (apt: any) => apt.patient_id === patient.patient_id
      )
      setPatientHistory(history)
    } catch (error) {
      console.error('Failed to fetch patient history')
    }
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
          <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
          <p className="text-gray-600 mt-2">View and manage your patients</p>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.patient_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card card-hover"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={patient.patient_photo || 'https://via.placeholder.com/80'}
                    alt={patient.patient_name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-primary-100"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{patient.patient_name}</h3>
                    <p className="text-sm text-gray-600">
                      {patient.patient_age} yrs | {patient.patient_gender}
                    </p>
                    <p className="text-sm text-gray-600">
                      Blood: {patient.patient_blood_group || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>Total Visits: <strong>{patient.total_visits}</strong></span>
                    <span>Last Visit: {formatDate(patient.last_visit)}</span>
                  </div>
                  <button
                    onClick={() => viewPatientDetails(patient)}
                    className="btn-outline w-full flex items-center justify-center space-x-2"
                  >
                    <FaEye />
                    <span>View Details</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaUser className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No patients found</h3>
            <p className="text-gray-500">Patients will appear here after consultations</p>
          </div>
        )}

        {/* Patient Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Patient Details"
          size="lg"
        >
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="flex items-center space-x-4 pb-6 border-b">
                <img
                  src={selectedPatient.patient_photo || 'https://via.placeholder.com/100'}
                  alt={selectedPatient.patient_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedPatient.patient_name}</h3>
                  <p className="text-gray-600">{selectedPatient.patient_email}</p>
                  <p className="text-gray-600">{selectedPatient.patient_phone}</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedPatient.patient_age} years</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedPatient.patient_gender}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedPatient.patient_blood_group || 'N/A'}</p>
                </div>
              </div>

              {/* Visit History */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  <FaFileAlt className="inline mr-2" />
                  Visit History
                </h4>
                {patientHistory.length > 0 ? (
                  <div className="space-y-3">
                    {patientHistory.map((visit) => (
                      <div key={visit.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{formatDate(visit.appointment_date)}</p>
                            <p className="text-sm text-gray-600">{visit.reason}</p>
                          </div>
                          <span className="badge badge-success">{visit.status}</span>
                        </div>
                        {visit.consultation_notes && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-gray-600">
                              <strong>Notes:</strong> {visit.consultation_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No visit history available</p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default DoctorPatients