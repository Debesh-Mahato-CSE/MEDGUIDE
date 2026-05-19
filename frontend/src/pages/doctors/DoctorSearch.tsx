import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaUserMd } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState<any[]>([])
  const [specializations, setSpecializations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    city: '',
    minFee: '',
    maxFee: '',
    minRating: '',
    sortBy: 'rating'
  })

  useEffect(() => {
    fetchSpecializations()
    fetchDoctors()
  }, [])

  useEffect(() => {
    fetchDoctors()
  }, [filters])

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/doctors/specializations')
      setSpecializations(response.data.specializations)
    } catch (error) {
      console.error('Failed to fetch specializations')
    }
  }

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/doctors/all?${params}`)
      setDoctors(response.data.doctors)
    } catch (error) {
      toast.error('Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Doctors</h1>
          <p className="text-gray-600">Search and book appointments with verified healthcare professionals</p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor name or specialization..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
              className="input-field"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec.specialization} value={spec.specialization}>
                  {spec.specialization} ({spec.count})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="number"
              placeholder="Min Fee"
              value={filters.minFee}
              onChange={(e) => handleFilterChange('minFee', e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max Fee"
              value={filters.maxFee}
              onChange={(e) => handleFilterChange('maxFee', e.target.value)}
              className="input-field"
            />
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="input-field"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="input-field"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="fee_low">Fee: Low to High</option>
              <option value="fee_high">Fee: High to Low</option>
            </select>
            <button
              onClick={() => setFilters({
                search: '', specialization: '', city: '', minFee: '', maxFee: '', minRating: '', sortBy: 'rating'
              })}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card card-hover"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={doctor.profile_photo || 'https://via.placeholder.com/80'}
                    alt={doctor.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">Dr. {doctor.full_name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <div className="flex items-center mt-1">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">
                        {doctor.avg_rating ? Number(doctor.avg_rating).toFixed(1) : 'New'}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({doctor.review_count || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center">
                    <FaUserMd className="mr-2 text-primary-500" />
                    {doctor.experience} years experience
                  </p>
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-primary-500" />
                    {doctor.city}, {doctor.state}
                  </p>
                  <p className="font-semibold text-gray-800">
                    Consultation Fee: ₹{doctor.consultation_fee}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="btn-outline flex-1 text-center text-sm"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/patient/book-appointment/${doctor.id}`}
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaUserMd className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorSearch