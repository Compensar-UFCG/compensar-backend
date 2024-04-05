import { Question } from "../models/question.model";

export const textProcessing = (text: string) => text.replaceAll('&#x2F;', '/');

export const questionDataProcessing = (question: Omit<Question, 'id'>) => {
  const { title, statement, image, font, year, type, alternatives, response } = question;

  const questionProcessing: Omit<Question, 'id'> = {
    title: textProcessing(title),
    statement: textProcessing(statement),
    image,
    font,
    year,
    type,
    alternatives: alternatives ? alternatives.map(alternative => textProcessing(alternative)) : alternatives,
    response: textProcessing(response)
  }

  return questionProcessing;
}

export const filterCompetences =  (competences: string[]) => {
  const uniqueCompetencesSet = new Set(competences);
  const uniqueCompetencesArray = Array.from(uniqueCompetencesSet);
  
  return uniqueCompetencesArray;
}