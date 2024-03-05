import { Schema, model, Document } from 'mongoose';

import { UUID } from "crypto";
interface Competence extends Document{
  id: UUID
  title: `${string & {length: 100}}`;
  description: `${string & {length: 255}}`;
}

const competenceSchema = new Schema<Competence>({
  id: Schema.Types.UUID,
  title: String,
  description: String,
});

export default model<Competence>('Competence', competenceSchema);

