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
const competence_model_1 = __importDefault(require("../models/competence.model"));
const competences_validation_1 = require("../utils/competences.validation");
const error_1 = require("../utils/error");
const router = (0, express_1.Router)();
router.get('/competences', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const competences = yield competence_model_1.default.find();
        res.status(200).json(competences);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.get('/competences/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const competence = yield competence_model_1.default.findById(id);
        if (!competence) {
            return res.status(404).json({ message: 'Competence not found' });
        }
        res.status(200).json(competence);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.post('/competences', competences_validation_1.sanitizationCompetenceBody, competences_validation_1.competenceValidationSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isError, message } = (0, competences_validation_1.checkIsValidCompetenceBody)(req);
    if (isError)
        return res.status(422).json({ message });
    const competence = new competence_model_1.default({
        title: req.body.title,
        description: req.body.description,
    });
    try {
        const newCompetence = yield competence.save();
        res.status(201).json(newCompetence);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.put('/competences/:id', competences_validation_1.sanitizationCompetenceBody, competences_validation_1.competenceValidationSchema, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isError, message } = (0, competences_validation_1.checkIsValidCompetenceBody)(req);
    if (isError)
        return res.status(422).json({ message });
    const id = req.params.id;
    const { title, description } = req.body;
    try {
        const competence = yield competence_model_1.default.findByIdAndUpdate(id, { title, description }, { new: true });
        if (!competence) {
            return res.status(404).json({ message: 'Competence not found' });
        }
        res.json(competence);
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
router.delete('/competences/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const competence = yield competence_model_1.default.findByIdAndDelete(id);
        if (!competence) {
            return res.status(404).json({ message: 'Competence not found' });
        }
        res.status(200).json({ message: `Delete competence '${competence.title}' with success` });
    }
    catch (err) {
        const error = (0, error_1.getErrorObject)(err);
        res.status(error.status).json(error);
    }
}));
exports.default = router;
