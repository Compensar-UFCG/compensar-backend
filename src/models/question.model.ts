import { Schema, model } from 'mongoose';

import { UUID } from 'crypto';

type Font = "enem" | "pisa" | "olimpiadas" | "school" | "other"
type Alternatives = string[];

export interface Question {
  id: UUID;
  title: string;
  statement: string;
  image?: string;
  type: string;
  font: Font;
  year?: number;
  alternatives?: Alternatives;
  response: string;
}

const questionSchema = new Schema<Question>({
  id: Schema.Types.UUID,
  title: {
    type: String,
    required: true,
    unique: true
  },
  statement: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: false,
    unique: false
  },
  type: {
    type: String,
    required: true,
    unique: false
  },
  font: {
    type: String,
    required: true,
    unique: false
  },
  year: {
    type: Number,
    required: false,
    unique: false
  },
  alternatives: {
    type: Schema.Types.Array,
    required: false,
    unique: false
  },
  response: {
    type: String,
    required: true,
    unique: false
  },
});

export default model<Question>('Question', questionSchema);
