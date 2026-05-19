import { Link } from 'react-router-dom'
import { FaLock, FaHome } from 'react-icons/fa'

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500">
      <div className="text-center text-white">
        <FaLock className="mx-auto mb-6" size={100} />
        <h1 className="text-6xl font-bold mb-4">403</h1>
        <h2 className="text-4xl font-semibold mb-4">Access Denied</h2>
        <p className="text-xl mb-8">You don't have permission to access this page.</p>
        <Link to="/" className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2">
          <FaHome />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized