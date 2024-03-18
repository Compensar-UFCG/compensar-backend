"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const questionSchema = new mongoose_1.Schema({
    id: mongoose_1.Schema.Types.UUID,
    title: {
        type: String,
        required: true,
        unique: true
    },
    statement: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false,
        unique: false
    },
    type: {
        type: String,
        required: true,
        unique: false
    },
    font: {
        type: String,
        required: true,
        unique: false
    },
    year: {
        type: Number,
        required: false,
        unique: false
    },
    alternatives: {
        type: mongoose_1.Schema.Types.Array,
        required: false,
        unique: false
    },
    response: {
        type: String,
        required: true,
        unique: false
    },
});
exports.default = (0, mongoose_1.model)('Question', questionSchema);
