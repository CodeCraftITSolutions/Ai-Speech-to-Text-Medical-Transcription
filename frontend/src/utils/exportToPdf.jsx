import jsPDF from "jspdf";

const DEFAULT_MARGIN_LEFT = 10;
const DEFAULT_LINE_HEIGHT = 10;

const getSafeValue = (value) =>
  value === undefined || value === null || value === "" ? "N/A" : value;

const exportToPDF = ({
  patientName,
  patientId,
  dateOfBirth,
  specialty,
  transcript,
} = {}) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Title
  doc.setFontSize(16);
  doc.text("Medical Transcription", DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_LEFT);

  // Patient Info
  doc.setFontSize(12);
  doc.text(
    `Patient Name: ${getSafeValue(patientName)}`,
    DEFAULT_MARGIN_LEFT,
    DEFAULT_MARGIN_LEFT + DEFAULT_LINE_HEIGHT
  );
  doc.text(
    `Patient ID: ${getSafeValue(patientId)}`,
    DEFAULT_MARGIN_LEFT,
    DEFAULT_MARGIN_LEFT + DEFAULT_LINE_HEIGHT * 2
  );
  doc.text(
    `Date of Birth: ${getSafeValue(dateOfBirth)}`,
    DEFAULT_MARGIN_LEFT,
    DEFAULT_MARGIN_LEFT + DEFAULT_LINE_HEIGHT * 3
  );
  doc.text(
    `Specialty: ${getSafeValue(specialty)}`,
    DEFAULT_MARGIN_LEFT,
    DEFAULT_MARGIN_LEFT + DEFAULT_LINE_HEIGHT * 4
  );

  // Transcript Section
  doc.setFontSize(12);
  const transcriptHeaderOffset = DEFAULT_MARGIN_LEFT + DEFAULT_LINE_HEIGHT * 5.5;
  doc.text("Transcript:", DEFAULT_MARGIN_LEFT, transcriptHeaderOffset);

  const safeTranscript = getSafeValue(transcript).toString();
  const splitText = doc.splitTextToSize(safeTranscript, 180);
  doc.text(splitText, DEFAULT_MARGIN_LEFT, transcriptHeaderOffset + DEFAULT_LINE_HEIGHT);

  doc.save("transcription.pdf");
};

export default exportToPDF;
