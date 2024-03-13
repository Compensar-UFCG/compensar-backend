"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const competenceSchema = new mongoose_1.Schema({
    id: mongoose_1.Schema.Types.UUID,
    title: String,
    description: String,
});
exports.default = (0, mongoose_1.model)('Competence', competenceSchema);
