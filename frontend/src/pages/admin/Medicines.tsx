import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPills, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'

const AdminMedicines = () => {
  const [medicines, setMedicines] = useState<any[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    uses: '',
    sideEffects: '',
    dosage: '',
    warnings: '',
    drugInteractions: '',
    alternatives: '',
    manufacturer: '',
    price: ''
  })
  const [medicineImage, setMedicineImage] = useState<File | null>(null)

  useEffect(() => {
    fetchMedicines()
  }, [])

  useEffect(() => {
    filterMedicines()
  }, [medicines, searchQuery, categoryFilter])

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines/all?limit=1000')
      setMedicines(response.data.medicines)
    } catch (error) {
      toast.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  const filterMedicines = () => {
    let filtered = medicines

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(med => med.category === categoryFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(med =>
        med.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.generic_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredMedicines(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      if (medicineImage) {
        submitData.append('medicineImage', medicineImage)
      }

      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Medicine updated successfully')
      } else {
        await api.post('/medicines/add', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Medicine added successfully')
      }

      setShowModal(false)
      resetForm()
      fetchMedicines()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save medicine')
    }
  }

  const handleEdit = (medicine: any) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name || '',
      genericName: medicine.generic_name || '',
      category: medicine.category || '',
      uses: medicine.uses || '',
      sideEffects: medicine.side_effects || '',
      dosage: medicine.dosage || '',
      warnings: medicine.warnings || '',
      drugInteractions: medicine.drug_interactions || '',
      alternatives: medicine.alternatives || '',
      manufacturer: medicine.manufacturer || '',
      price: medicine.price || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return

    try {
      await api.delete(`/medicines/${id}`)
      toast.success('Medicine deleted successfully')
      fetchMedicines()
    } catch (error) {
      toast.error('Failed to delete medicine')
    }
  }

  const resetForm = () => {
    setEditingMedicine(null)
    setFormData({
      name: '',
      genericName: '',
      category: '',
      uses: '',
      sideEffects: '',
      dosage: '',
      warnings: '',
      drugInteractions: '',
      alternatives: '',
      manufacturer: '',
      price: ''
    })
    setMedicineImage(null)
  }

  const categories = ['Pain Relief', 'Antibiotic', 'Antihistamine', 'Antacid', 'Diabetes', 'Cholesterol', 'Blood Thinner', 'Blood Pressure', 'Vitamin', 'Other']

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Medicines Management</h1>
            <p className="text-gray-600 mt-2">Add and manage medicine database</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Medicine</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Medicines Grid */}
        {filteredMedicines.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => (
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
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FaPills className="text-white" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{medicine.name}</h3>
                    {medicine.generic_name && (
                      <p className="text-sm text-gray-600">{medicine.generic_name}</p>
                    )}
                    <span className="badge badge-info mt-2">{medicine.category}</span>
                  </div>
                </div>

                {medicine.uses && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medicine.uses}</p>
                )}

                {medicine.price && (
                  <p className="text-lg font-bold text-primary-600 mb-3">₹{medicine.price}</p>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(medicine)}
                    className="flex-1 btn-outline flex items-center justify-center space-x-2"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaPills className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No medicines found</h3>
            <p className="text-gray-500">Add your first medicine to get started</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title={editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Generic Name</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setMedicineImage(e.target.files[0])}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Uses</label>
              <textarea
                value={formData.uses}
                onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Side Effects</label>
              <textarea
                value={formData.sideEffects}
                onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warnings</label>
              <textarea
                value={formData.warnings}
                onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Drug Interactions</label>
              <textarea
                value={formData.drugInteractions}
                onChange={(e) => setFormData({ ...formData, drugInteractions: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alternatives</label>
              <input
                type="text"
                value={formData.alternatives}
                onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default AdminMedicines