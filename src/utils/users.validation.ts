import { Request } from 'express';
import { body, checkSchema, Result, ValidationError, validationResult } from 'express-validator';
import { allErrorMessage } from './error';

const MIN_LENGTH_USERNAME=3;
const MIN_LENGTH_PASSWORD=8;
const MAX_LENGTH_USERNAME=15;
const MAX_LENGTH_PASSWORD=12;

interface UserErrorMessages {
  usernameEmpty: string;
  usernameLength: string;
  usernameWhitespace: string;
  emailEmpty: string;
  emailInvalid: string;
  passwordEmpty: string;
  passwordLength: string;
  passwordInvalid: string;
}

export const userErrorMessages: UserErrorMessages = {
  usernameEmpty: 'O nome do usuário não pode ser vazio',
  usernameLength: `O nome do usuário deve ter no mínimo ${MIN_LENGTH_USERNAME} caracteres e no máximo ${MAX_LENGTH_USERNAME} caracteres`,
  usernameWhitespace: 'O nome do usuário não pode conter espaços em branco',
  emailEmpty: 'O e-mail não pode ser vazio',
  emailInvalid: 'E-mail inválido',
  passwordEmpty: 'A senha não pode ser vazia',
  passwordLength: `A senha deve ter no mínimo ${MIN_LENGTH_PASSWORD} caracteres e no máximo ${MAX_LENGTH_PASSWORD} caracteres`,
  passwordInvalid: 'A senha deve conter letras maiúsculas, números e caracteres especiais'
}

export const userValidationSchema = checkSchema({
  username: {
    notEmpty: { errorMessage: userErrorMessages.usernameEmpty },
    isLength: {
      options: { min: MIN_LENGTH_USERNAME, max: MAX_LENGTH_USERNAME },
      errorMessage: userErrorMessages.usernameLength
    },
    matches: {
      options: /^\S*$/,
      errorMessage: userErrorMessages.usernameWhitespace
    }
  },
  email: {
    notEmpty: { errorMessage: userErrorMessages.emailEmpty },
    isEmail: { errorMessage: userErrorMessages.emailInvalid }
  },
  password: {
    notEmpty: { errorMessage: userErrorMessages.passwordEmpty },
    isLength: {
      options: { min: MIN_LENGTH_PASSWORD, max: MAX_LENGTH_PASSWORD },
      errorMessage: userErrorMessages.passwordLength
    },
    matches: {
      options: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
      errorMessage: userErrorMessages.passwordInvalid,
    },
  }
}, ['body']);

export const sanitizationUserBody =
  [
    body('name')
      .trim()
      .escape(),
    body('username')
      .trim()
      .escape(),
    body('email')
      .trim()
      .escape(),
    body('password')
      .trim()
  ]

export const checkIsValidUserBody = (req: Request) => {
  const errors: Result = validationResult(req);
  const errorMessages: ValidationError[] = errors.array();

  return {
    isError: !!errorMessages.length,
    message: allErrorMessage(errorMessages)}
}
