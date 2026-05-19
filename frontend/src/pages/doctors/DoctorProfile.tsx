import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaStar, FaMapMarkerAlt, FaCalendar, FaClock, FaGraduationCap, FaAward, FaLanguage, FaCheckCircle } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

const DoctorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    fetchDoctorProfile()
  }, [id])

  const fetchDoctorProfile = async () => {
    try {
      const response = await api.get(`/doctors/${id}`)
      setDoctor(response.data.doctor)
    } catch (error) {
      toast.error('Failed to load doctor profile')
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = () => {
    if (!user) {
      toast.error('Please login to book an appointment')
      navigate('/login')
      return
    }
    if (user.role !== 'patient') {
      toast.error('Only patients can book appointments')
      return
    }
    navigate(`/patient/book-appointment/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor not found</h2>
          <Link to="/doctors" className="btn-primary">Back to Search</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={doctor.profile_photo || 'https://via.placeholder.com/150'}
              alt={doctor.full_name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary-100"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">Dr. {doctor.full_name}</h1>
                    {doctor.verification_status === 'verified' && (
                      <FaCheckCircle className="text-green-500" size={24} title="Verified Doctor" />
                    )}
                  </div>
                  <p className="text-xl text-gray-600 mb-2">{doctor.specialization}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-semibold">
                        {doctor.avg_rating ? Number(doctor.avg_rating).toFixed(1) : 'New'}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({doctor.review_count || 0} reviews)
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{doctor.completed_appointments || 0} consultations</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">₹{doctor.consultation_fee}</p>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <FaGraduationCap className="mr-2 text-primary-500" />
                  <span>{doctor.qualification}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaAward className="mr-2 text-primary-500" />
                  <span>{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-primary-500" />
                  <span>{doctor.city}, {doctor.state}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaLanguage className="mr-2 text-primary-500" />
                  <span>{doctor.languages || 'English, Hindi'}</span>
                </div>
              </div>

              <button onClick={handleBookAppointment} className="btn-primary">
                <FaCalendar className="mr-2" />
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="border-b mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`tab ${activeTab === 'about' ? 'tab-active' : ''}`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`}
              >
                Reviews ({doctor.review_count || 0})
              </button>
              <button
                onClick={() => setActiveTab('clinic')}
                className={`tab ${activeTab === 'clinic' ? 'tab-active' : ''}`}
              >
                Clinic Info
              </button>
            </div>
          </div>

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {doctor.bio && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">About Doctor</h3>
                  <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Professional Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Qualification</p>
                    <p className="font-semibold text-gray-800">{doctor.qualification}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-semibold text-gray-800">{doctor.experience} years</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="font-semibold text-gray-800">{doctor.license_number}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Medical Council</p>
                    <p className="font-semibold text-gray-800">{doctor.medical_council}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {doctor.reviews && doctor.reviews.length > 0 ? (
                doctor.reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.patient_photo || 'https://via.placeholder.com/50'}
                        alt={review.patient_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{review.patient_name}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No reviews yet</p>
              )}
            </div>
          )}

          {/* Clinic Tab */}
          {activeTab === 'clinic' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Clinic Information</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{doctor.clinic_name}</h4>
                  <p className="text-gray-700 mb-4">{doctor.clinic_address}</p>
                  <p className="text-gray-600">
                    {doctor.city}, {doctor.state} - {doctor.pincode}
                  </p>
                  {doctor.maps_link && (
                    <a
                      href={doctor.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
                    >
                      View on Google Maps →
                    </a>
                  )}
                </div>
              </div>

              {doctor.available_days && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Available Days</h3>
                  <p className="text-gray-700">{doctor.available_days}</p>
                </div>
              )}

              {doctor.available_time_slots && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Available Timings</h3>
                  <p className="text-gray-700">{doctor.available_time_slots}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile