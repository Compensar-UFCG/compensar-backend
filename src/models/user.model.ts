import { Schema, model } from 'mongoose';

import { UUID } from 'crypto';

interface User {
  id: UUID;
  name?: string;
  username: string;
  email: string;
  password: string;
}

const userSchema = new Schema<User>({
  id: Schema.Types.UUID,
  name: {
    type: String,
    required: false,
    unique: false
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

export default model<User>('User', userSchema);
