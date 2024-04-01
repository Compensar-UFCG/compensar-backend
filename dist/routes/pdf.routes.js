"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const pdf_1 = require("../utils/pdf");
const router = (0, express_1.Router)();
router.post('/pdf', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = req.body;
    const doc = new pdfkit_1.default();
    const fontPath = path_1.default.join(__dirname, '../../public/fonts', 'OpenSans-Regular.ttf');
    doc.font(fontPath);
    doc.fontSize(20).text(quiz.title, { align: 'center' });
    doc.moveDown(1);
    quiz.questions.map(question => {
        var _a;
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
        (_a = question.alternatives) === null || _a === void 0 ? void 0 : _a.map((alternative, index) => {
            doc.fontSize(12).text(pdf_1.alphabet[index] + alternative);
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
}));
exports.default = router;
