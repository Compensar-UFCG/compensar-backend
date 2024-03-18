"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsValidQuestionBody = exports.sanitizationQuestionBody = exports.questionValidationSchema = exports.questionErrorMessages = void 0;
const express_validator_1 = require("express-validator");
const error_1 = require("./error");
const MIN_LENGTH = 3;
const MAX_LENGTH_RESPONSE = 100;
const MAX_LENGTH_TITLE = 100;
const MAX_LENGTH_TYPE = 50;
exports.questionErrorMessages = {
    titleEmpty: 'Title isn`t empty',
    titleLength: `Title need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_TITLE} characters`,
    statementEmpty: 'Statement isn`t empty',
    typeEmpty: 'Type isn`t empty',
    typeLength: `Title need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_TYPE} characters`,
    fontEmpty: 'Font isn`t empty',
    fontMacth: 'Font is invalid',
    yearMatch: 'Year is invalid',
    alternativesLenght: 'Need at least two alternatives',
    responseEmpty: 'Response isn`t empty',
    responseLength: `Response need maximum ${MAX_LENGTH_RESPONSE} characters`
};
exports.questionValidationSchema = (0, express_validator_1.checkSchema)({
    title: {
        notEmpty: { errorMessage: exports.questionErrorMessages.titleEmpty },
        isLength: {
            options: { min: MIN_LENGTH, max: MAX_LENGTH_TITLE },
            errorMessage: exports.questionErrorMessages.titleLength
        }
    },
    statement: {
        notEmpty: { errorMessage: exports.questionErrorMessages.statementEmpty },
    },
    type: {
        notEmpty: { errorMessage: exports.questionErrorMessages.typeEmpty },
        isLength: {
            options: { min: MIN_LENGTH, max: MAX_LENGTH_TYPE },
            errorMessage: exports.questionErrorMessages.typeLength
        },
    },
    font: {
        notEmpty: { errorMessage: exports.questionErrorMessages.fontEmpty },
        matches: {
            options: /\b(enem|pisa|olimpiadas|school|other)\b$/,
            errorMessage: exports.questionErrorMessages.fontMacth,
        }
    },
    year: {
        optional: true,
        matches: {
            options: /^(19\d{2}|[2-9]\d{3,})$/,
            errorMessage: exports.questionErrorMessages.yearMatch,
        }
    },
    alternatives: {
        optional: true,
        isArray: {
            options: { min: 2 },
            errorMessage: exports.questionErrorMessages.alternativesLenght
        }
    },
    response: {
        notEmpty: { errorMessage: exports.questionErrorMessages.responseEmpty },
        isLength: {
            options: { max: MAX_LENGTH_RESPONSE },
            errorMessage: exports.questionErrorMessages.responseLength
        }
    },
}, ['body']);
exports.sanitizationQuestionBody = [
    (0, express_validator_1.body)('title')
        .trim()
        .escape(),
    (0, express_validator_1.body)('statement')
        .trim()
        .escape(),
    (0, express_validator_1.body)('type')
        .trim()
        .escape(),
    (0, express_validator_1.body)('font')
        .trim()
        .escape(),
    (0, express_validator_1.body)('image')
        .trim()
        .escape(),
    (0, express_validator_1.body)('response')
        .trim()
        .escape(),
];
const checkIsValidQuestionBody = (req) => {
    const errors = (0, express_validator_1.validationResult)(req);
    const errorMessages = errors.array();
    return {
        isError: !!errorMessages.length,
        message: (0, error_1.allErrorMessage)(errorMessages)
    };
};
exports.checkIsValidQuestionBody = checkIsValidQuestionBody;
