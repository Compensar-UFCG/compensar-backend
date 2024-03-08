import { ValidationError } from "express-validator";

export const allErrorMessage = (errorMessages: ValidationError[]): string => {
  return errorMessages.map(error => error.msg).join()
}