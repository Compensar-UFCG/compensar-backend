import express, { Application } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import competenceRoutes from './routes/competence.routes';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', competenceRoutes);

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
