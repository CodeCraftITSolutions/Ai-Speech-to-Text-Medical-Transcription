import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const getSafeValue = (value) =>
  value === undefined || value === null || value === "" ? "N/A" : value;

const exportToWord = ({
  patientName,
  patientId,
  dateOfBirth,
  specialty,
  transcript,
} = {}) => {
  const transcriptLines = getSafeValue(transcript)
    .toString()
    .split(/\r?\n/)
    .map((line) => new Paragraph(line || ""));

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Medical Transcription",
                bold: true,
                size: 28, // font size in half-points, 28 = 14pt
              }),
            ],
          }),
          new Paragraph(`Patient Name: ${getSafeValue(patientName)}`),
          new Paragraph(`Patient ID: ${getSafeValue(patientId)}`),
          new Paragraph(`Date of Birth: ${getSafeValue(dateOfBirth)}`),
          new Paragraph(`Specialty: ${getSafeValue(specialty)}`),
          new Paragraph({ text: "" }), // spacer
          new Paragraph({
            children: [new TextRun({ text: "Transcript:", bold: true })],
          }),
          ...transcriptLines,
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "transcription.docx");
  });
};

export default exportToWord;
