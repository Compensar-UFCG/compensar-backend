import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import { Quiz, alphabet } from '../utils/pdf';

const router: Router = Router();

router.post('/pdf', async (req: Request, res: Response) => {
  const quiz: Quiz = req.body;

  const doc = new PDFDocument();

  const fontPath = path.join(__dirname, '../utils/fonts', 'OpenSans-Regular.ttf');
  doc.font(fontPath);

  doc.fontSize(20).text(quiz.title, { align: 'center' });
  doc.moveDown(1);

  quiz.questions.map(question => {
    doc.fontSize(18).text(question.title);
    doc.moveDown(0.1);
    doc.fontSize(10).text(`Fonte: ${question.font} ${question.year} [${question.type}]`);
    doc.moveDown(0.8);
    doc.fontSize(14).text('Problema');
    doc.moveDown(0.6);
    doc.fontSize(12).text(question.statement);
    doc.moveDown(0.8);
    doc.fontSize(14).text('Alternativas');
    doc.moveDown(0.6);
    question.alternatives?.map((alternative, index) => {
      doc.fontSize(12).text(alphabet[index] + alternative);
      doc.moveDown(0.2);
    });
    doc.moveDown(0.6);
    doc.fontSize(14).text('Resposta');
    doc.moveDown(0.6);
    doc.fontSize(12).text(question.response);
    doc.moveDown(1);
  });

  res.setHeader('Content-Disposition', `attachment; filename=${quiz.title}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);
  doc.end();
});

export default router;

