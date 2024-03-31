import express, { Application } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import competenceRoutes from './routes/competence.routes';
import questionRoutes from './routes/question.routes';
import userRoutes from './routes/user.routes';
import loginRoutes from './routes/login.routes';
import competenceQuestionRoutes from './routes/competenceQuestion.routes';
import pdfRoutes from './routes/pdf.routes';

import dotenv from 'dotenv';
import authenticateToken from './middlewares/authenticator';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

app.use('/api', loginRoutes);
app.use('/api', competenceRoutes);
app.use('/api', pdfRoutes);

app.use('/api', userRoutes);
app.use('/api', authenticateToken, questionRoutes);
app.use('/api', authenticateToken, competenceQuestionRoutes);

mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.beoiebt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log(process.env);
    
    console.error('Error connecting to MongoDB:', err.message)
  });
