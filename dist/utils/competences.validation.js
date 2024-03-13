"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsValidCompetenceBody = exports.sanitizationCompetenceBody = exports.competenceValidationSchema = exports.competenceErrorMessages = void 0;
const express_validator_1 = require("express-validator");
const error_1 = require("./error");
const MIN_LENGTH = 3;
const MAX_LENGTH_TITLE = 100;
const MAX_LENGTH_DESCRIPTION = 255;
exports.competenceErrorMessages = {
    titleEmpty: 'Title isn`t empty',
    titleLength: `Title need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_TITLE} characters`,
    descriptionEmpty: 'Description isn`t empty',
    descriptionLength: `Description need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_DESCRIPTION} characters`
};
exports.competenceValidationSchema = (0, express_validator_1.checkSchema)({
    title: {
        notEmpty: { errorMessage: exports.competenceErrorMessages.titleEmpty },
        isLength: {
            options: { min: MIN_LENGTH, max: MAX_LENGTH_TITLE },
            errorMessage: exports.competenceErrorMessages.titleLength
        },
    },
    description: {
        notEmpty: { errorMessage: exports.competenceErrorMessages.descriptionEmpty },
        isLength: {
            options: { min: MIN_LENGTH, max: MAX_LENGTH_DESCRIPTION },
            errorMessage: exports.competenceErrorMessages.descriptionLength
        }
    },
}, ['body']);
exports.sanitizationCompetenceBody = [
    (0, express_validator_1.body)('title')
        .trim()
        .escape(),
    (0, express_validator_1.body)('description')
        .trim()
        .escape(),
];
const checkIsValidCompetenceBody = (req) => {
    const errors = (0, express_validator_1.validationResult)(req);
    const errorMessages = errors.array();
    return {
        isError: !!errorMessages.length,
        message: (0, error_1.allErrorMessage)(errorMessages)
    };
};
exports.checkIsValidCompetenceBody = checkIsValidCompetenceBody;
