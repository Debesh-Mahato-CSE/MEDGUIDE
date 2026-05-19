import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPills, FaExclamationTriangle, FaInfoCircle, FaArrowLeft } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const MedicineDetails = () => {
  const { id } = useParams()
  const [medicine, setMedicine] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMedicineDetails()
  }, [id])

  const fetchMedicineDetails = async () => {
    try {
      const response = await api.get(`/medicines/${id}`)
      setMedicine(response.data.medicine)
    } catch (error) {
      toast.error('Failed to load medicine details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Medicine not found</h2>
          <Link to="/medicines" className="btn-primary">Back to Search</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/medicines" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Search
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="card mb-6">
            <div className="flex items-start space-x-6">
              {medicine.medicine_image ? (
                <img
                  src={medicine.medicine_image}
                  alt={medicine.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <FaPills className="text-white" size={48} />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{medicine.name}</h1>
                {medicine.generic_name && (
                  <p className="text-lg text-gray-600 mb-2">
                    Generic: {medicine.generic_name}
                  </p>
                )}
                <div className="flex items-center space-x-4">
                  <span className="badge badge-info">{medicine.category}</span>
                  {medicine.manufacturer && (
                    <span className="text-sm text-gray-600">
                      By {medicine.manufacturer}
                    </span>
                  )}
                </div>
                {medicine.price && (
                  <p className="text-2xl font-bold text-primary-600 mt-3">
                    ₹{medicine.price}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Uses */}
          {medicine.uses && (
            <div className="card mb-6">
              <div className="flex items-start space-x-3">
                <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Uses</h2>
                  <p className="text-gray-700 leading-relaxed">{medicine.uses}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dosage */}
          {medicine.dosage && (
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Dosage Information</h2>
              <p className="text-gray-700">{medicine.dosage}</p>
            </div>
          )}

          {/* Side Effects */}
          {medicine.side_effects && (
            <div className="card mb-6 bg-red-50 border-l-4 border-red-500">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-red-800 mb-3">Side Effects</h2>
                  <p className="text-red-700 leading-relaxed">{medicine.side_effects}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {medicine.warnings && (
            <div className="card mb-6 bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-yellow-800 mb-3">Warnings & Precautions</h2>
                  <p className="text-yellow-700 leading-relaxed">{medicine.warnings}</p>
                </div>
              </div>
            </div>
          )}

          {/* Drug Interactions */}
          {medicine.drug_interactions && (
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Drug Interactions</h2>
              <p className="text-gray-700">{medicine.drug_interactions}</p>
            </div>
          )}

          {/* Alternatives */}
          {medicine.alternatives && (
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Alternatives</h2>
              <p className="text-gray-700">{medicine.alternatives}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>⚠️ Medical Disclaimer:</strong> This information is for educational purposes only. 
              Always consult with a qualified healthcare professional before starting any medication. 
              Do not self-medicate based on this information.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MedicineDetails