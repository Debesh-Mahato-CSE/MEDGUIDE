-- MedGuide Healthcare Management System Database Schema

-- Drop existing database if exists
DROP DATABASE IF EXISTS medguide;

-- Create database
CREATE DATABASE medguide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE medguide;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'patient') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Doctors Table
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(255),
    qualification TEXT,
    experience INT,
    license_number VARCHAR(100),
    medical_council VARCHAR(255),
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    maps_link TEXT,
    consultation_fee DECIMAL(10,2),
    languages TEXT,
    bio TEXT,
    available_days TEXT,
    available_time_slots TEXT,
    profile_photo VARCHAR(255),
    license_document VARCHAR(255),
    degree_document VARCHAR(255),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_specialization (specialization),
    INDEX idx_city (city),
    INDEX idx_verification (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patients Table
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    age INT,
    gender ENUM('Male', 'Female', 'Other'),
    blood_group VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    allergies TEXT,
    existing_diseases TEXT,
    current_medications TEXT,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    smoking_habit ENUM('Yes', 'No', 'Occasionally'),
    alcohol_consumption ENUM('Yes', 'No', 'Occasionally'),
    emergency_contact_name VARCHAR(255),
    emergency_contact_relation VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments Table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    symptoms TEXT,
    priority ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
    status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    consultation_fee DECIMAL(10,2),
    consultation_notes TEXT,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medicines Table
CREATE TABLE medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100),
    uses TEXT,
    side_effects TEXT,
    dosage TEXT,
    warnings TEXT,
    drug_interactions TEXT,
    alternatives TEXT,
    manufacturer VARCHAR(255),
    price DECIMAL(10,2),
    medicine_image VARCHAR(255),
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prescriptions Table
CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_number VARCHAR(50) UNIQUE NOT NULL,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT,
    diagnosis TEXT,
    medicines JSON,
    notes TEXT,
    follow_up_date DATE,
    pdf_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_doctor (doctor_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical Reports Table
CREATE TABLE medical_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    report_type VARCHAR(100),
    report_name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    report_date DATE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_report_type (report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages Table (for chat functionality)
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Admin User
-- Password: admin123 (hashed)
INSERT INTO users (email, password, role, full_name, phone, is_active, created_at) 
VALUES (
    'admin@medguide.com', 
    '$2a$10$YourHashedPasswordHere', 
    'admin', 
    'Admin User', 
    '9999999999', 
    TRUE, 
    NOW()
);

-- Sample Medicines Data
INSERT INTO medicines (name, generic_name, category, uses, side_effects, dosage, price, created_at) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Pain Relief', 'For fever and pain relief', 'Nausea, allergic reactions', '500mg, 3 times daily', 20.00, NOW()),
('Ibuprofen 400mg', 'Ibuprofen', 'Pain Relief', 'For inflammation and pain', 'Stomach upset, dizziness', '400mg, 2-3 times daily', 35.00, NOW()),
('Amoxicillin 500mg', 'Amoxicillin', 'Antibiotic', 'Bacterial infections', 'Diarrhea, nausea', '500mg, 3 times daily', 80.00, NOW()),
('Cetirizine 10mg', 'Cetirizine', 'Antihistamine', 'Allergies and cold', 'Drowsiness, dry mouth', '10mg, once daily', 15.00, NOW()),
('Omeprazole 20mg', 'Omeprazole', 'Antacid', 'Acid reflux and ulcers', 'Headache, nausea', '20mg, once daily', 45.00, NOW()),
('Metformin 500mg', 'Metformin', 'Diabetes', 'Type 2 diabetes', 'Diarrhea, stomach upset', '500mg, twice daily', 25.00, NOW()),
('Atorvastatin 10mg', 'Atorvastatin', 'Cholesterol', 'High cholesterol', 'Muscle pain, headache', '10mg, once daily', 55.00, NOW()),
('Aspirin 75mg', 'Acetylsalicylic Acid', 'Blood Thinner', 'Heart disease prevention', 'Stomach bleeding, nausea', '75mg, once daily', 10.00, NOW()),
('Losartan 50mg', 'Losartan', 'Blood Pressure', 'High blood pressure', 'Dizziness, fatigue', '50mg, once daily', 40.00, NOW()),
('Vitamin D3 1000IU', 'Cholecalciferol', 'Vitamin', 'Vitamin D deficiency', 'Rare side effects', '1000IU, once daily', 30.00, NOW());

-- Create indexes for better performance
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_prescriptions_date ON prescriptions(created_at);
CREATE INDEX idx_reviews_created ON reviews(created_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Triggers for automatic updates
DELIMITER //

CREATE TRIGGER after_appointment_status_update
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO notifications (user_id, type, title, message, created_at)
        SELECT user_id, 'appointment', 'Appointment Completed', 
               CONCAT('Your appointment on ', NEW.appointment_date, ' has been marked as completed'),
               NOW()
        FROM patients WHERE id = NEW.patient_id;
    END IF;
END//

DELIMITER ;

-- Views for analytics
CREATE VIEW doctor_statistics AS
SELECT 
    d.id,
    d.full_name,
    d.specialization,
    d.city,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
    AVG(r.rating) as avg_rating,
    COUNT(DISTINCT r.id) as total_reviews,
    d.consultation_fee,
    d.verification_status
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN reviews r ON d.id = r.doctor_id
GROUP BY d.id;

CREATE VIEW patient_statistics AS
SELECT 
    p.id,
    p.full_name,
    p.city,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT pr.id) as total_prescriptions,
    COUNT(DISTINCT mr.id) as total_reports
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN prescriptions pr ON p.id = pr.patient_id
LEFT JOIN medical_reports mr ON p.id = mr.patient_id
GROUP BY p.id;

-- Stored procedure for appointment analytics
DELIMITER //

CREATE PROCEDURE GetAppointmentAnalytics(IN days INT)
BEGIN
    SELECT 
        DATE(appointment_date) as date,
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        SUM(consultation_fee) as revenue
    FROM appointments
    WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL days DAY)
    GROUP BY DATE(appointment_date)
    ORDER BY date DESC;
END//

DELIMITER ;

-- Grant privileges (adjust as needed)
-- GRANT ALL PRIVILEGES ON medguide.* TO 'medguide_user'@'localhost' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;