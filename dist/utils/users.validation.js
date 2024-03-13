"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsValidUserBody = exports.sanitizationUserBody = exports.userValidationSchema = exports.userErrorMessages = void 0;
const express_validator_1 = require("express-validator");
const error_1 = require("./error");
const MIN_LENGTH_USERNAME = 3;
const MIN_LENGTH_PASSWORD = 8;
const MAX_LENGTH_USERNAME = 15;
const MAX_LENGTH_PASSWORD = 12;
exports.userErrorMessages = {
    usernameEmpty: 'O nome do usuário não pode ser vazio',
    usernameLength: `O nome do usuário deve ter no mínimo ${MIN_LENGTH_USERNAME} caracteres e no máximo ${MAX_LENGTH_USERNAME} caracteres`,
    usernameWhitespace: 'O nome do usuário não pode conter espaços em branco',
    emailEmpty: 'O e-mail não pode ser vazio',
    emailInvalid: 'E-mail inválido',
    passwordEmpty: 'A senha não pode ser vazia',
    passwordLength: `A senha deve ter no mínimo ${MIN_LENGTH_PASSWORD} caracteres e no máximo ${MAX_LENGTH_PASSWORD} caracteres`,
    passwordInvalid: 'A senha deve conter letras maiúsculas, números e caracteres especiais'
};
exports.userValidationSchema = (0, express_validator_1.checkSchema)({
    username: {
        notEmpty: { errorMessage: exports.userErrorMessages.usernameEmpty },
        isLength: {
            options: { min: MIN_LENGTH_USERNAME, max: MAX_LENGTH_USERNAME },
            errorMessage: exports.userErrorMessages.usernameLength
        },
        matches: {
            options: /^\S*$/,
            errorMessage: exports.userErrorMessages.usernameWhitespace
        }
    },
    email: {
        notEmpty: { errorMessage: exports.userErrorMessages.emailEmpty },
        isEmail: { errorMessage: exports.userErrorMessages.emailInvalid }
    },
    password: {
        notEmpty: { errorMessage: exports.userErrorMessages.passwordEmpty },
        isLength: {
            options: { min: MIN_LENGTH_PASSWORD, max: MAX_LENGTH_PASSWORD },
            errorMessage: exports.userErrorMessages.passwordLength
        },
        matches: {
            options: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
            errorMessage: exports.userErrorMessages.passwordInvalid,
        },
    }
}, ['body']);
exports.sanitizationUserBody = [
    (0, express_validator_1.body)('name')
        .trim()
        .escape(),
    (0, express_validator_1.body)('username')
        .trim()
        .escape(),
    (0, express_validator_1.body)('email')
        .trim()
        .escape(),
    (0, express_validator_1.body)('password')
        .trim()
];
const checkIsValidUserBody = (req) => {
    const errors = (0, express_validator_1.validationResult)(req);
    const errorMessages = errors.array();
    return {
        isError: !!errorMessages.length,
        message: (0, error_1.allErrorMessage)(errorMessages)
    };
};
exports.checkIsValidUserBody = checkIsValidUserBody;
