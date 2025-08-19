import jsPDF from "jspdf";

const exportToPDF = (
  patientName,
  patientId,
  dateOfBirth,
  specialty,
  transcript
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("Medical Transcription", 10, 10);

  // Patient Info
  doc.setFontSize(12);
  doc.text(`Patient Name: ${patientName}`, 10, 20);
  doc.text(`Patient ID: ${patientId}`, 10, 30);
  doc.text(`Date of Birth: ${dateOfBirth}`, 10, 40);
  doc.text(`Specialty: ${specialty}`, 10, 50);

  // Transcript Section
  doc.setFontSize(12);
  doc.text("Transcript:", 10, 65);

  // Multi-line transcript text wrapping
  const splitText = doc.splitTextToSize(transcript, 180);
  doc.text(splitText, 10, 75);

  doc.save("transcription.pdf");
};

export default exportToPDF;
