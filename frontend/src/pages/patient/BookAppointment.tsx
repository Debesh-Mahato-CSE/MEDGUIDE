import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCalendar, FaClock, FaUserMd } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const BookAppointment = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    symptoms: '',
    priority: 'normal'
  })

  useEffect(() => {
    fetchDoctorDetails()
  }, [doctorId])

  useEffect(() => {
    if (formData.appointmentDate) {
      fetchAvailableSlots()
    }
  }, [formData.appointmentDate])

  const fetchDoctorDetails = async () => {
    try {
      const response = await api.get(`/doctors/${doctorId}`)
      setDoctor(response.data.doctor)
    } catch (error) {
      toast.error('Failed to load doctor details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get(`/appointments/available-slots?doctorId=${doctorId}&date=${formData.appointmentDate}`)
      setAvailableSlots(response.data.availableSlots)
    } catch (error) {
      console.error('Failed to fetch available slots')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    setBooking(true)
    try {
      await api.post('/appointments/book', {
        doctorId,
        ...formData
      })
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setBooking(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Doctor Info */}
          <div className="card mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={doctor?.profile_photo || 'https://via.placeholder.com/80'}
                alt={doctor?.full_name}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dr. {doctor?.full_name}</h2>
                <p className="text-gray-600">{doctor?.specialization}</p>
                <p className="text-primary-600 font-semibold">Consultation Fee: ₹{doctor?.consultation_fee}</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    min={getTomorrowDate()}
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value, appointmentTime: '' })}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Time Slot Selection */}
              {formData.appointmentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time Slot *
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormData({ ...formData, appointmentTime: slot })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.appointmentTime === slot
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          <FaClock className="inline mr-2" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No slots available for this date</p>
                  )}
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Describe your health concern..."
                  required
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms (Optional)
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="List your symptoms..."
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/doctors')}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="btn-primary"
                >
                  {booking ? (
                    <div className="spinner w-5 h-5 border-2"></div>
                  ) : (
                    'Book Appointment'
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

export default BookAppointment