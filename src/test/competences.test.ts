import request from 'supertest';
import router from '../routes/competence.routes';
import competencesMock from "./mocks/competencesMock.json";
import express from 'express';
import CompetenceModel from '../models/competence.model';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

jest.mock('../models/competence.model');

describe('Competence Routes - API requests success and erros', () => {
  beforeEach(() => {
    CompetenceModel.find = jest.fn().mockReturnValueOnce(competencesMock);
    CompetenceModel.findById = jest.fn().mockReturnValueOnce(competencesMock[0]);
    CompetenceModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(competencesMock[0]);
  });

  describe('GET /competences', () => {
    it('responds with json array of competences', async () => {
      const response = await request(app).get('/competences');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(competencesMock);
    });

    it('responds with 500 status if an error occurs', async () => {
      CompetenceModel.find = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).get('/competences');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });

  describe('GET /competences/:id', () => {
    it('responds with json competence data', async () => {
      const response = await request(app).get('/competences/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(competencesMock[0]);
    });

    it('responds with 404 status if competence not found', async () => {
      CompetenceModel.findById = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).get('/competences/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Competence not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      CompetenceModel.findById = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).get('/competences/123');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });

  describe('PUT /competences/:id', () => {
    it('responds with json competence data', async () => {
      const payload = competencesMock[0];
      const response = await request(app).put('/competences/123').send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(payload);
    }, 100);

    it('responds with 404 status if competence not found', async () => {
      const payload = competencesMock[0];
      CompetenceModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).put('/competences/nonexistent_id').send(payload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Competence not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      const payload = competencesMock[0];
      CompetenceModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).put('/competences/123').send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });

});

describe('Competence Routes - sanitization and validation body errors', () => {
});