import { Question } from "../models/question.model";

export interface Quiz {
  title: string;
  questions: Question[];
}

export const alphabet = [
  "a) ",
  "b) ",
  "c) ",
  "d) ",
  "e) ",
  "f) ",
  "g) ",
  "h) ",
  "i) ",
  "j) ",
  "k) ",
  "l) ",
]