const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePrescriptionPDF = async (prescriptionData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `prescription-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads/prescriptions', fileName);

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('MedGuide', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Digital Prescription', { align: 'center' });
      doc.moveDown();

      // Horizontal line
      doc.strokeColor('#667eea').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Doctor Information
      doc.fontSize(14).font('Helvetica-Bold').text('Doctor Information:');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Dr. ${prescriptionData.doctorName}`);
      doc.text(`Specialization: ${prescriptionData.specialization}`);
      doc.text(`License No: ${prescriptionData.licenseNumber}`);
      doc.text(`Clinic: ${prescriptionData.clinicName}`);
      doc.moveDown();

      // Patient Information
      doc.fontSize(14).font('Helvetica-Bold').text('Patient Information:');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${prescriptionData.patientName}`);
      doc.text(`Age: ${prescriptionData.patientAge} years`);
      doc.text(`Gender: ${prescriptionData.patientGender}`);
      doc.text(`Date: ${new Date(prescriptionData.prescriptionDate).toLocaleDateString()}`);
      doc.moveDown();

      // Diagnosis
      if (prescriptionData.diagnosis) {
        doc.fontSize(14).font('Helvetica-Bold').text('Diagnosis:');
        doc.fontSize(10).font('Helvetica').text(prescriptionData.diagnosis);
        doc.moveDown();
      }

      // Medicines
      doc.fontSize(14).font('Helvetica-Bold').text('Prescribed Medicines:');
      doc.moveDown(0.5);

      prescriptionData.medicines.forEach((medicine, index) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${index + 1}. ${medicine.name}`);
        doc.fontSize(9).font('Helvetica');
        doc.text(`   Dosage: ${medicine.dosage}`);
        doc.text(`   Duration: ${medicine.duration}`);
        doc.text(`   Instructions: ${medicine.instructions}`);
        doc.moveDown(0.5);
      });

      // Additional Notes
      if (prescriptionData.notes) {
        doc.moveDown();
        doc.fontSize(14).font('Helvetica-Bold').text('Additional Notes:');
        doc.fontSize(10).font('Helvetica').text(prescriptionData.notes);
      }

      // Footer
      doc.moveDown(2);
      doc.strokeColor('#667eea').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text(`Dr. ${prescriptionData.doctorName}`, { align: 'right' });
      doc.fontSize(9).font('Helvetica').text('Digital Signature', { align: 'right' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.generateInvoicePDF = async (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads/invoices', fileName);

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.fontSize(10).text('MedGuide Healthcare', { align: 'center' });
      doc.moveDown();

      // Invoice Details
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice No: ${invoiceData.invoiceNumber}`, 50, 150);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 165);
      doc.text(`Patient: ${invoiceData.patientName}`, 50, 180);

      // Table Header
      const tableTop = 250;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Amount', 400, tableTop);

      // Line
      doc.strokeColor('#000').lineWidth(1)
         .moveTo(50, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .stroke();

      // Items
      let y = tableTop + 30;
      doc.font('Helvetica');
      doc.text('Consultation Fee', 50, y);
      doc.text(`₹${invoiceData.consultationFee}`, 400, y);

      // Total
      y += 50;
      doc.strokeColor('#000').lineWidth(1)
         .moveTo(50, y)
         .lineTo(550, y)
         .stroke();

      y += 15;
      doc.font('Helvetica-Bold');
      doc.text('Total Amount:', 50, y);
      doc.text(`₹${invoiceData.consultationFee}`, 400, y);

      doc.end();

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};