import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Public Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import DoctorSearch from './pages/doctors/DoctorSearch'
import DoctorProfile from './pages/doctors/DoctorProfile'
import MedicineSearch from './pages/medicines/MedicineSearch'
import MedicineDetails from './pages/medicines/MedicineDetails'
import SymptomChecker from './pages/SymptomChecker'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import PatientProfile from './pages/patient/Profile'
import PatientAppointments from './pages/patient/Appointments'
import BookAppointment from './pages/patient/BookAppointment'
import PatientPrescriptions from './pages/patient/Prescriptions'
import PatientReports from './pages/patient/Reports'
import PatientTimeline from './pages/patient/Timeline'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorProfileEdit from './pages/doctor/Profile'
import DoctorAppointments from './pages/doctor/Appointments'
import CreatePrescription from './pages/doctor/CreatePrescription'
import DoctorPatients from './pages/doctor/Patients'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminDoctors from './pages/admin/Doctors'
import AdminAppointments from './pages/admin/Appointments'
import AdminMedicines from './pages/admin/Medicines'
import AdminAnalytics from './pages/admin/Analytics'

// Error Pages
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}/dashboard`} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/doctors" element={<DoctorSearch />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/medicines" element={<MedicineSearch />} />
            <Route path="/medicines/:id" element={<MedicineDetails />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/patient/profile" element={
              user?.role === 'patient' ? <PatientProfile /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/patient/appointments" element={
              user?.role === 'patient' ? <PatientAppointments /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/patient/book-appointment/:doctorId" element={
              user?.role === 'patient' ? <BookAppointment /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/patient/prescriptions" element={
              user?.role === 'patient' ? <PatientPrescriptions /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/patient/reports" element={
              user?.role === 'patient' ? <PatientReports /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/patient/timeline" element={
              user?.role === 'patient' ? <PatientTimeline /> : <Navigate to="/unauthorized" />
            } />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/doctor/profile" element={
              user?.role === 'doctor' ? <DoctorProfileEdit /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/doctor/appointments" element={
              user?.role === 'doctor' ? <DoctorAppointments /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/doctor/create-prescription/:appointmentId" element={
              user?.role === 'doctor' ? <CreatePrescription /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/doctor/patients" element={
              user?.role === 'doctor' ? <DoctorPatients /> : <Navigate to="/unauthorized" />
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/admin/users" element={
              user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/admin/doctors" element={
              user?.role === 'admin' ? <AdminDoctors /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/admin/appointments" element={
              user?.role === 'admin' ? <AdminAppointments /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/admin/medicines" element={
              user?.role === 'admin' ? <AdminMedicines /> : <Navigate to="/unauthorized" />
            } />
            <Route path="/admin/analytics" element={
              user?.role === 'admin' ? <AdminAnalytics /> : <Navigate to="/unauthorized" />
            } />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App