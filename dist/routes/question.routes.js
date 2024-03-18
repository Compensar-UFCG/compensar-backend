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
const question_model_1 = __importDefault(require("../models/question.model"));
const error_1 = require("../utils/error");
const questions_validation_1 = require("../utils/questions.validation");
const router = (0, express_1.Router)();
router.get('/questions', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questions = yield question_model_1.default.find();
        res.status(200).json(questions);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.get('/questions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const question = yield question_model_1.default.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.post('/questions', questions_validation_1.sanitizationQuestionBody, questions_validation_1.questionValidationSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isError, message } = (0, questions_validation_1.checkIsValidQuestionBody)(req);
    if (isError)
        return res.status(422).json({ message });
    const { title, statement, image, font, year, type, alternatives, response } = req.body;
    try {
        const question = new question_model_1.default({
            title,
            statement,
            image,
            font,
            year,
            type,
            alternatives,
            response
        });
        const newQuestion = yield question.save();
        res.status(201).json({ message: `Created '${newQuestion.title}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.put('/questions/:id', questions_validation_1.sanitizationQuestionBody, questions_validation_1.questionValidationSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isError, message } = (0, questions_validation_1.checkIsValidQuestionBody)(req);
    if (isError)
        return res.status(422).json({ message });
    const id = req.params.id;
    const { title, statement, image, font, year, type, alternatives, response } = req.body;
    try {
        const question = yield question_model_1.default.findByIdAndUpdate(id, {
            title,
            statement,
            image,
            font,
            year,
            type,
            alternatives,
            response
        }, { new: true });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ message: `Updated '${question.title}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.delete('/questions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const question = yield question_model_1.default.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: `Delete question '${question.title}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
exports.default = router;
