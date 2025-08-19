import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const exportToWord = (
  patientName,
  patientId,
  dateOfBirth,
  specialty,
  transcript
) => {
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
          new Paragraph(`Patient Name: ${patientName}`),
          new Paragraph(`Patient ID: ${patientId}`),
          new Paragraph(`Date of Birth: ${dateOfBirth}`),
          new Paragraph(`Specialty: ${specialty}`),
          new Paragraph({ text: "" }), // spacer
          new Paragraph({
            children: [new TextRun({ text: "Transcript:", bold: true })],
          }),
          new Paragraph(transcript || ""), // handle empty transcript
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "transcription.docx");
  });
};

export default exportToWord;
