import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPrescription, FaDownload, FaEye } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { formatDate } from '../../utils/helpers'

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions/patient/list')
      setPrescriptions(response.data.prescriptions)
    } catch (error) {
      toast.error('Failed to fetch prescriptions')
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = (prescription: any) => {
    setSelectedPrescription(prescription)
    setShowDetailModal(true)
  }

  const downloadPrescription = (pdfUrl: string, prescriptionNumber: string) => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `prescription-${prescriptionNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <h1 className="text-3xl font-bold text-gray-800">My Prescriptions</h1>
          <p className="text-gray-600 mt-2">View and download your digital prescriptions</p>
        </div>

        {prescriptions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {prescriptions.map((prescription) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPrescription className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Dr. {prescription.doctor_name}
                        </h3>
                        <p className="text-sm text-gray-600">{prescription.specialization}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(prescription.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Prescription #:</strong> {prescription.prescription_number}
                    </p>
                    {prescription.diagnosis && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Diagnosis:</strong> {prescription.diagnosis}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewDetails(prescription)}
                        className="btn-outline flex items-center space-x-2 text-sm"
                      >
                        <FaEye />
                        <span>View</span>
                      </button>
                      {prescription.pdf_file && (
                        <button
                          onClick={() => downloadPrescription(prescription.pdf_file, prescription.prescription_number)}
                          className="btn-primary flex items-center space-x-2 text-sm"
                        >
                          <FaDownload />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaPrescription className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No prescriptions yet</h3>
            <p className="text-gray-500">Your prescriptions will appear here after doctor consultations</p>
          </div>
        )}

        {/* Prescription Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Prescription Details"
          size="lg"
        >
          {selectedPrescription && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Dr. {selectedPrescription.doctor_name}
                    </h3>
                    <p className="text-gray-600">{selectedPrescription.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Prescription Number</p>
                    <p className="font-semibold text-gray-800">{selectedPrescription.prescription_number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(selectedPrescription.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPrescription.diagnosis && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
                  <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Prescribed Medicines</h4>
                <div className="space-y-3">
                  {selectedPrescription.medicines && selectedPrescription.medicines.map((medicine: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-800">{index + 1}. {medicine.name}</h5>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>Dosage:</strong> {medicine.dosage}</p>
                        <p><strong>Duration:</strong> {medicine.duration}</p>
                        <p><strong>Instructions:</strong> {medicine.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Additional Notes</h4>
                  <p className="text-gray-700">{selectedPrescription.notes}</p>
                </div>
              )}

              {selectedPrescription.follow_up_date && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Follow-up Date</h4>
                  <p className="text-gray-700">{formatDate(selectedPrescription.follow_up_date)}</p>
                </div>
              )}

              {selectedPrescription.pdf_file && (
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => downloadPrescription(selectedPrescription.pdf_file, selectedPrescription.prescription_number)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Download PDF</span>
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

export default PatientPrescriptions