import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSearch, FaPills } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const MedicineSearch = () => {
  const [medicines, setMedicines] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchMedicines()
  }, [])

  useEffect(() => {
    fetchMedicines()
  }, [searchQuery, selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/medicines/categories')
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Failed to fetch categories')
    }
  }

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await api.get(`/medicines/all?${params}`)
      setMedicines(response.data.medicines)
    } catch (error) {
      toast.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Medicine Information</h1>
          <p className="text-gray-600">Search for medicines and get detailed information</p>
        </div>

        {/* Search & Filters */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicines by name or generic name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : medicines.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card card-hover"
              >
                <div className="flex items-start space-x-4 mb-4">
                  {medicine.medicine_image ? (
                    <img
                      src={medicine.medicine_image}
                      alt={medicine.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FaPills className="text-white" size={32} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{medicine.name}</h3>
                    {medicine.generic_name && (
                      <p className="text-sm text-gray-600">{medicine.generic_name}</p>
                    )}
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mt-2">
                      {medicine.category}
                    </span>
                  </div>
                </div>

                {medicine.uses && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    <strong>Uses:</strong> {medicine.uses}
                  </p>
                )}

                {medicine.price && (
                  <p className="text-lg font-bold text-primary-600 mb-3">
                    ₹{medicine.price}
                  </p>
                )}

                <Link
                  to={`/medicines/${medicine.id}`}
                  className="btn-primary w-full text-center"
                >
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaPills className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No medicines found</h3>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicineSearch