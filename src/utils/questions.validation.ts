import { Request } from 'express';
import { body, checkSchema, Result, ValidationError, validationResult } from 'express-validator';
import { allErrorMessage } from './error';

const MIN_LENGTH=3;
const MAX_LENGTH_RESPONSE=255;
const MAX_LENGTH_TITLE=100;
const MAX_LENGTH_TYPE=50;

interface QuestionErrorMessages {
  titleEmpty: string;
  titleLength: string;
  statementEmpty: string;
  typeEmpty: string;
  typeLength: string;
  fontEmpty: string;
  fontMacth: string;
  yearMatch: string;
  alternativesLenght: string;
  responseEmpty: string;
  responseLength: string;
}
export const questionErrorMessages: QuestionErrorMessages = {
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
}

export const questionValidationSchema = checkSchema({
  title: {
    notEmpty: { errorMessage: questionErrorMessages.titleEmpty },
    isLength: {
      options: { min: MIN_LENGTH, max: MAX_LENGTH_TITLE },
      errorMessage: questionErrorMessages.titleLength
    }
  },
  statement: {
    notEmpty: { errorMessage: questionErrorMessages.statementEmpty },
  },
  type: {
    notEmpty: { errorMessage: questionErrorMessages.typeEmpty },
    isLength: {
      options: { min: MIN_LENGTH, max: MAX_LENGTH_TYPE },
      errorMessage: questionErrorMessages.typeLength
    },
  },
  font: {
    notEmpty: { errorMessage: questionErrorMessages.fontEmpty },
    matches: {
      options: /\b(enem|pisa|olimpiadas|school|other)\b$/,
      errorMessage: questionErrorMessages.fontMacth,
    }
  },
  year: {
    optional: true,
    matches: {
      options: /^(19\d{2}|[2-9]\d{3,})$/,
      errorMessage: questionErrorMessages.yearMatch,
    }
  },
  alternatives: {
    optional: true,
    isArray: {
      options:  { min: 2 },
      errorMessage: questionErrorMessages.alternativesLenght
    }
  },
  response: {
    notEmpty: { errorMessage: questionErrorMessages.responseEmpty },
    isLength: {
      options: { max: MAX_LENGTH_RESPONSE },
      errorMessage: questionErrorMessages.responseLength
    }
  },
}, ['body']);

export const sanitizationQuestionBody =
  [
    body('title')
      .trim()
      .escape(),
    body('statement')
      .trim()
      .escape(),
    body('type')
      .trim()
      .escape(),
    body('font')
      .trim()
      .escape(),
    body('image')
      .trim()
      .escape(),
    body('response')
      .trim()
      .escape(),
  ]

export const checkIsValidQuestionBody = (req: Request) => {
  const errors: Result = validationResult(req);
  const errorMessages: ValidationError[] = errors.array();

  return {
    isError: !!errorMessages.length,
    message: allErrorMessage(errorMessages)}
}
