"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const competenceQuestionSchema = new mongoose_1.Schema({
    competence: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Competence' },
    question: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Question' }
});
exports.default = (0, mongoose_1.model)('CompetenceQuestion', competenceQuestionSchema);
