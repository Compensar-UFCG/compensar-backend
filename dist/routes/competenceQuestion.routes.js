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
const competenceQuestion_model_1 = __importDefault(require("../models/competenceQuestion.model"));
const question_model_1 = __importDefault(require("../models/question.model"));
const competence_model_1 = __importDefault(require("../models/competence.model"));
const error_1 = require("../utils/error");
const router = (0, express_1.Router)();
router.get('/questions/:id/competences', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const questionId = req.params.id;
    try {
        const competenceQuestion = yield competenceQuestion_model_1.default.find({ question: questionId }).populate('question').populate('competence');
        if (!competenceQuestion)
            return res.status(404).json({ message: 'Question not found' });
        if (competenceQuestion.length === 0)
            return res.status(200).json(competenceQuestion);
        const competences = competenceQuestion.map(({ competence }) => competence);
        const competencesByQuestionId = {
            id: competenceQuestion[0].question.id,
            title: competenceQuestion[0].question.title,
            competences
        };
        res.status(200).json(competencesByQuestionId);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.get('/competences/:id/questions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const competenceId = req.params.id;
    try {
        const competenceQuestion = yield competenceQuestion_model_1.default.find({ competence: competenceId }).populate('question').populate('competence');
        if (!competenceQuestion)
            return res.status(404).json({ message: 'Competence not found' });
        if (competenceQuestion.length === 0)
            return res.status(200).json(competenceQuestion);
        const questions = competenceQuestion.map(({ question }) => question);
        const questionsByCompetenceId = {
            id: competenceQuestion[0].competence._id,
            title: competenceQuestion[0].competence.title,
            questions
        };
        res.status(200).json(questionsByCompetenceId);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.post('/questions/competences', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId, competenceId } = req.body;
    try {
        const existingCompetence = yield competence_model_1.default.findById(competenceId);
        if (!existingCompetence)
            return res.status(404).json({ message: 'Competence not found' });
        const existingQuestion = yield question_model_1.default.findById(questionId);
        if (!existingQuestion)
            return res.status(404).json({ message: 'Question not found' });
        const existingRelation = yield competenceQuestion_model_1.default.findOne({ competence: competenceId, question: questionId });
        if (existingRelation)
            return res.status(409).json({ message: 'Exist relation' });
        const competenceQuestion = new competenceQuestion_model_1.default({
            competence: competenceId,
            question: questionId
        });
        yield competenceQuestion.save();
        res.status(201).json({ message: 'Created with success' });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.delete('/questions/:questionId/competences/:competenceId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId, competenceId } = req.params;
    try {
        const existingCompetence = yield competence_model_1.default.findById(competenceId);
        if (!existingCompetence)
            return res.status(404).json({ message: 'Competence not found' });
        const existingQuestion = yield question_model_1.default.findById(questionId);
        if (!existingQuestion)
            return res.status(404).json({ message: 'Question not found' });
        const deletedRelation = yield competenceQuestion_model_1.default.findOneAndDelete({ competence: competenceId, question: questionId });
        if (!deletedRelation) {
            return res.status(404).json({ message: 'Relation not found' });
        }
        res.status(200).json({ message: 'Delete relation with success' });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
exports.default = router;
