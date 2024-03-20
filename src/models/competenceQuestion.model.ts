import { Schema, model } from 'mongoose';
import { Competence } from './competence.model';
import { Question } from './question.model';

interface CompetenceQuestion {
  competence: Competence
  question: Question
}

const competenceQuestionSchema = new Schema({
  competence: { type: Schema.Types.ObjectId, ref: 'Competence' },
  question: { type: Schema.Types.ObjectId, ref: 'Question' }
});

export default model<CompetenceQuestion>('CompetenceQuestion', competenceQuestionSchema);
