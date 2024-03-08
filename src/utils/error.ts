import { ValidationError } from "express-validator";

export const allErrorMessage = (errorMessages: ValidationError[]): string => {
  return errorMessages.map(error => error.msg).join()
}

interface Error {
  status: number,
  message: string;
}

export const getErrorObject = (err: any): Error => {
  return {
    status: err?.status || err?.statusCode || 500,
    message: err?.message || "Interner Server Error"
  };
}