import { Request } from 'express';
import { body, checkSchema, Result, ValidationError, validationResult } from 'express-validator';
import { allErrorMessage } from './error';

const MIN_LENGTH=3;
const MAX_LENGTH_TITLE=100;
const MAX_LENGTH_DESCRIPTION=255;

interface CompetenceErrorMessages {
  titleEmpty: string,
  titleLength: string,
  descriptionEmpty: string,
  descriptionLength: string,
}
export const competenceErrorMessages: CompetenceErrorMessages = {
  titleEmpty: 'Title isn`t empty',
  titleLength: `Title need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_TITLE} characters`,
  descriptionEmpty: 'Description isn`t empty',
  descriptionLength: `Description need minimum ${MIN_LENGTH} characters and maximum ${MAX_LENGTH_DESCRIPTION} characters`
}

export const competenceValidationSchema = checkSchema({
  title: {
    notEmpty: { errorMessage: competenceErrorMessages.titleEmpty },
    isLength: {
      options: { min: MIN_LENGTH, max: MAX_LENGTH_TITLE },
      errorMessage: competenceErrorMessages.titleLength
    },
  },
  description: {
    notEmpty: { errorMessage: competenceErrorMessages.descriptionEmpty },
    isLength: {
      options: { min: MIN_LENGTH, max: MAX_LENGTH_DESCRIPTION },
      errorMessage: competenceErrorMessages.descriptionLength
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
