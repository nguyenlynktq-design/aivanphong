import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Document as DocData } from '../types';

export async function exportToDocx(docData: DocData, organization?: string) {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20mm
              bottom: 1134, // 20mm
              left: 1701, // 30mm
              right: 850, // 15mm
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({ text: organization?.toUpperCase() || 'TÊN CƠ QUAN, ĐƠN VỊ', bold: true, size: 26 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Số: ${docData.number || '.../...'}` }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }), // Spacer

          // Title
          new Paragraph({
            children: [
              new TextRun({ text: docData.title.toUpperCase(), bold: true, size: 30 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
          }),

          // Content (Simplified for now, real markdown to docx is complex)
          ...docData.content.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun({ text: line, size: 28 })],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { line: 360 },
            })
          ),

          // Footer
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: docData.signerPosition?.toUpperCase() || 'CHỨC VỤ NGƯỜI KÝ', bold: true, size: 26 }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 800 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: docData.signerName?.toUpperCase() || 'HỌ VÀ TÊN NGƯỜI KÝ', bold: true, size: 28 }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 1200 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${docData.title}.docx`);
}
