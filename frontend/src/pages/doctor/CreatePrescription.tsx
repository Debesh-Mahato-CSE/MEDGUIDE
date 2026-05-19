import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

interface Medicine {
  name: string
  dosage: string
  duration: string
  instructions: string
}

const CreatePrescription = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [medicinesList, setMedicinesList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [formData, setFormData] = useState({
    diagnosis: '',
    notes: '',
    followUpDate: ''
  })
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', duration: '', instructions: '' }
  ])

  useEffect(() => {
    fetchAppointmentDetails()
    fetchMedicinesList()
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`)
      setAppointment(response.data.appointment)
    } catch (error) {
      toast.error('Failed to load appointment details')
      navigate('/doctor/appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchMedicinesList = async () => {
    try {
      const response = await api.get('/medicines/all?limit=100')
      setMedicinesList(response.data.medicines)
    } catch (error) {
      console.error('Failed to fetch medicines')
    }
  }

  const handleMedicineSearch = (query: string, index: number) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      const filtered = medicinesList.filter(med =>
        med.name.toLowerCase().includes(query.toLowerCase()) ||
        (med.generic_name && med.generic_name.toLowerCase().includes(query.toLowerCase()))
      )
      setSearchResults(filtered.slice(0, 5))
    } else {
      setSearchResults([])
    }

    const updatedMedicines = [...medicines]
    updatedMedicines[index].name = query
    setMedicines(updatedMedicines)
  }

  const selectMedicine = (medicine: any, index: number) => {
    const updatedMedicines = [...medicines]
    updatedMedicines[index].name = medicine.name
    updatedMedicines[index].dosage = medicine.dosage || ''
    setMedicines(updatedMedicines)
    setSearchResults([])
    setSearchQuery('')
  }

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const updatedMedicines = [...medicines]
    updatedMedicines[index][field] = value
    setMedicines(updatedMedicines)
  }

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', duration: '', instructions: '' }
    ])
  }

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      const updatedMedicines = medicines.filter((_, i) => i !== index)
      setMedicines(updatedMedicines)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const validMedicines = medicines.filter(med => med.name.trim() !== '')
    if (validMedicines.length === 0) {
      toast.error('Please add at least one medicine')
      return
    }

    setSaving(true)
    try {
      await api.post('/prescriptions/create', {
        patientId: appointment.patient_id,
        appointmentId: appointment.id,
        diagnosis: formData.diagnosis,
        medicines: validMedicines,
        notes: formData.notes,
        followUpDate: formData.followUpDate || null
      })

      toast.success('Prescription created successfully')
      navigate('/doctor/appointments')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create prescription')
    } finally {
      setSaving(false)
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Appointments
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Patient Info */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Information</h2>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={appointment?.patient_photo || 'https://via.placeholder.com/80'}
                alt={appointment?.patient_name}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{appointment?.patient_name}</h3>
                <p className="text-gray-600">
                  Age: {appointment?.patient_age} | Gender: {appointment?.patient_gender}
                </p>
                <p className="text-gray-600">
                  Blood Group: {appointment?.patient_blood_group || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Appointment Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(appointment?.appointment_date)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Reason for Visit</p>
                <p className="font-semibold text-gray-800">{appointment?.reason}</p>
              </div>
              {appointment?.symptoms && (
                <div className="md:col-span-2">
                  <p className="text-gray-600">Symptoms</p>
                  <p className="font-semibold text-gray-800">{appointment?.symptoms}</p>
                </div>
              )}
              {appointment?.allergies && (
                <div className="md:col-span-2 bg-red-50 p-3 rounded-lg">
                  <p className="text-red-800 font-semibold">⚠️ Allergies: {appointment?.allergies}</p>
                </div>
              )}
            </div>
          </div>

          {/* Prescription Form */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Create Prescription</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter diagnosis..."
                  required
                />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Prescribed Medicines *
                  </label>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    <FaPlus />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {medicines.map((medicine, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 p-4 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">Medicine #{index + 1}</h4>
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicine(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medicine Name *
                          </label>
                          <input
                            type="text"
                            value={medicine.name}
                            onChange={(e) => handleMedicineSearch(e.target.value, index)}
                            className="input-field"
                            placeholder="Search medicine..."
                            required
                          />
                          {searchResults.length > 0 && medicine.name && (
                            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                              {searchResults.map((med) => (
                                <div
                                  key={med.id}
                                  onClick={() => selectMedicine(med, index)}
                                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                                >
                                  <p className="font-semibold text-gray-800">{med.name}</p>
                                  {med.generic_name && (
                                    <p className="text-sm text-gray-600">{med.generic_name}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosage *
                          </label>
                          <input
                            type="text"
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                            className="input-field"
                            placeholder="e.g., 500mg twice daily"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration *
                          </label>
                          <input
                            type="text"
                            value={medicine.duration}
                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                            className="input-field"
                            placeholder="e.g., 5 days"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instructions
                          </label>
                          <input
                            type="text"
                            value={medicine.instructions}
                            onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                            className="input-field"
                            placeholder="e.g., After meals"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Any additional instructions or notes..."
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/doctor/appointments')}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <div className="spinner w-5 h-5 border-2"></div>
                  ) : (
                    <>
                      <FaSave />
                      <span>Create Prescription</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CreatePrescription