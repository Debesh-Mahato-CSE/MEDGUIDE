import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUserMd, FaPills, FaStethoscope, FaCalendarCheck, FaHospital, FaStar } from 'react-icons/fa'

const Home = () => {
  const features = [
    {
      icon: FaUserMd,
      title: 'Find Expert Doctors',
      description: 'Search and book appointments with verified healthcare professionals'
    },
    {
      icon: FaCalendarCheck,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments at your convenience with real-time availability'
    },
    {
      icon: FaPills,
      title: 'Medicine Information',
      description: 'Access comprehensive information about medicines and treatments'
    },
    {
      icon: FaStethoscope,
      title: 'Digital Prescriptions',
      description: 'Receive and manage your prescriptions digitally'
    }
  ]

  const specializations = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedic',
    'Gynecologist',
    'Dentist',
    'ENT Specialist'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Connect with verified doctors, book appointments, and manage your health records all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/doctors" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Find Doctors
                </Link>
                <Link to="/register" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300">
                  Register Now
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
                alt="Healthcare"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Find the Right Doctor
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search by doctor name..."
                className="input-field"
              />
              <select className="input-field">
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <Link to="/doctors" className="btn-primary text-center">
                Search Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose MedGuide?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare management at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center card-hover"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Browse by Specialization
            </h2>
            <p className="text-xl text-gray-600">
              Find specialists for your specific health needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <Link
                key={index}
                to={`/doctors?specialization=${spec}`}
                className="card text-center card-hover cursor-pointer"
              >
                <FaHospital className="text-primary-500 mx-auto mb-3" size={32} />
                <p className="font-semibold text-gray-800">{spec}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-bold mb-2">500+</h3>
              <p className="text-lg">Verified Doctors</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">10K+</h3>
              <p className="text-lg">Happy Patients</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">50+</h3>
              <p className="text-lg">Specializations</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">24/7</h3>
              <p className="text-lg">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of patients who trust MedGuide for their healthcare needs
          </p>
          <Link to="/register" className="btn-primary text-lg px-12 py-4">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home