import { Request } from 'express';
import { body, checkSchema, Result, ValidationError, validationResult } from 'express-validator';
import { allErrorMessage } from './error';

const MIN_LENGTH=3;
const MAX_LENGTH_TITLE=100;
const MAX_LENGTH_DESCRIPTION=255;

export const competenceValidationSchema = checkSchema({
  title: {
    notEmpty: { errorMessage: 'Title isn`t empty' },
    isString: { errorMessage: 'Title is a text'},
    isLength: {
      options: { min: MIN_LENGTH, max: MAX_LENGTH_TITLE },
      errorMessage: `Title need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_TITLE} characters`
    },
  },
  description: {
    notEmpty: { errorMessage: 'Description isn`t empty' },
    isString: { errorMessage: 'Description is a text'},
    isLength: {
      options: { min: MIN_LENGTH, max: MAX_LENGTH_DESCRIPTION },
      errorMessage: `Description need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_DESCRIPTION} characters`
    }
  },
}, ['body']);

export const sanitizationCompetenceBody =
  [
    body('title')
      .trim()
      .escape(),
    body('description')
      .trim()
      .escape(),
  ]

export const checkIsValidCompetenceBody = (req: Request) => {
  const errors: Result = validationResult(req);
  const errorMessages: ValidationError[] = errors.array();

  return {
    isError: !!errorMessages.length,
    message: allErrorMessage(errorMessages)}
}
