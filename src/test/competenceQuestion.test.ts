import express from 'express';
import bodyParser from 'body-parser';

import request from 'supertest';
import router from '../routes/competenceQuestion.routes';

import CompetenceQuestionModel from '../models/competenceQuestion.model';
import CompetenceModel from '../models/competence.model';
import QuestionModel from '../models/question.model';

import competencesByQuestionIdUnhandledMock from "./mocks/competenceQuestionBefore/competencesByQuestionIdUnhandledMock.json";
import questionsByCompetenceIdUnhandledMock from "./mocks/competenceQuestionBefore/questionsByCompetenceIdUnhandledMock.json";

import competencesByQuestionIdMock from "./mocks/competenceQuestionAfter/competencesByQuestionIdMock.json";
import questionsByCompetenceIdMock from "./mocks/competenceQuestionAfter/questionsByCompetenceIdMock.json";

import competencesMock from "./mocks/competencesMock.json";
import questionsMock from "./mocks/questionsWithoutCompetencesMock.json";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

jest.mock('../models/competenceQuestion.model');
describe('Relation Competences and Questions Routes - API requests success and erros', () => {
  describe('GET /questions/:id/competences', () => {
    it('responds with json empty array of competences and API return success', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue([])
        }))
      }))

      const response = await request(app).get('/questions/123/competences');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('responds with json array of competences by question id', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(competencesByQuestionIdUnhandledMock)
        }))
      }))

      const response = await request(app).get('/questions/123/competences');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(competencesByQuestionIdMock);
    });

    it('responds with 404 when not found question id', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(undefined)
        }))
      }))

      const response = await request(app).get('/questions/123/competences');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Question not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockRejectedValue(new Error('Internal Server Error'))
        }))
      }))

      const response = await request(app).get('/questions/123/competences');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });

    it('responds with 500 status and default error message when no pass a error message', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockRejectedValue(new Error())
        }))
      }))

      const response = await request(app).get('/questions/123/competences');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Interner Server Error' });
    });
  });

  describe('GET /competences/:id/questions', () => {
    it('responds with json empty array of questions and API return success', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue([])
        }))
      }))

      const response = await request(app).get('/competences/123/questions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('responds with json array of questions by competence id', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(questionsByCompetenceIdUnhandledMock)
        }))
      }))

      const response = await request(app).get('/competences/123/questions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(questionsByCompetenceIdMock);
    });

    it('responds with 404 when not found competence id', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(undefined)
        }))
      }))

      const response = await request(app).get('/competences/123/questions');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Competence not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockRejectedValue(new Error('Internal Server Error'))
        }))
      }))

      const response = await request(app).get('/competences/123/questions');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });

    it('responds with 500 status and default error message when no pass a error message', async () => {
      CompetenceQuestionModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockRejectedValue(new Error())
        }))
      }))

      const response = await request(app).get('/competences/123/questions');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Interner Server Error' });
    });
  });

  describe('POST /questions/competences', () => {
    beforeEach(() => {
      CompetenceModel.findById = jest.fn().mockReturnValueOnce(competencesMock[0]);
      QuestionModel.findById = jest.fn().mockReturnValueOnce(questionsMock[0]);
      CompetenceQuestionModel.findOne = jest.fn().mockReturnValueOnce(undefined);
    })

    it('responds with success when try create a relation with question and competence', async () => {
      const payload = {
        "questionId": "65f8dca475aca9ea2c068c44",
        "competenceId": "65e717356b58df0b9764fd09"
      }

      const mockSaveCompetenceQuestionRelation = jest.spyOn(new CompetenceQuestionModel(), 'save')
      mockSaveCompetenceQuestionRelation.mockImplementation(jest.fn().mockReturnValueOnce(payload));

      const response = await request(app).post('/questions/competences').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Created with success' });
    });

    it('responds with 404 question not found when question not exist', async () => {
      const payload = {
        "questionId": "65f8dca475aca9ea2c068c44",
        "competenceId": "65e717356b58df0b9764fd09"
      }
      QuestionModel.findById = jest.fn().mockReturnValueOnce(undefined);

      const mockSaveCompetenceQuestionRelation = jest.spyOn(new CompetenceQuestionModel(), 'save')
      mockSaveCompetenceQuestionRelation.mockImplementation(jest.fn().mockReturnValueOnce(payload));

      const response = await request(app).post('/questions/competences').send(payload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Question not found' });
    });

    it('responds with 404 competence not found when competence not exist', async () => {
      const payload = {
        "questionId": "65f8dca475aca9ea2c068c44",
        "competenceId": "65e717356b58df0b9764fd09"
      }
      CompetenceModel.findById = jest.fn().mockReturnValueOnce(undefined);

      const mockSaveCompetenceQuestionRelation = jest.spyOn(new CompetenceQuestionModel(), 'save')
      mockSaveCompetenceQuestionRelation.mockImplementation(jest.fn().mockReturnValueOnce(payload));

      const response = await request(app).post('/questions/competences').send(payload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Competence not found' });
    });

    it('responds with 409 when exist relation with question and competence', async () => {
      const payload = {
        "questionId": "65f8dca475aca9ea2c068c44",
        "competenceId": "65e717356b58df0b9764fd09"
      }
      CompetenceQuestionModel.findOne = jest.fn().mockReturnValueOnce(payload);

      const mockSaveCompetenceQuestionRelation = jest.spyOn(new CompetenceQuestionModel(), 'save')
      mockSaveCompetenceQuestionRelation.mockImplementation(jest.fn().mockReturnValueOnce(payload));

      const response = await request(app).post('/questions/competences').send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: 'Exist relation' });
    });
    it('responds with 500 status if an error occurs', async () => {
      const mockSaveCompetenceQuestionRelation = jest.spyOn(new CompetenceQuestionModel(), 'save')
      mockSaveCompetenceQuestionRelation.mockImplementation(jest.fn().mockRejectedValue(new Error('Internal Server Error')));

      const payload = {
        "questionId": "65f8dca475aca9ea2c068c44",
        "competenceId": "65e717356b58df0b9764fd09"
      }
      const response = await request(app).post('/questions/competences').send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });

  describe('DELETE /questions/:questionId/competences/:competenceId', () => {
    const payload = {
      "questionId": "65f8dca475aca9ea2c068c44",
      "competenceId": "65e717356b58df0b9764fd09"
    }
    beforeEach(() => {
      CompetenceModel.findById = jest.fn().mockReturnValueOnce(competencesMock[0]);
      QuestionModel.findById = jest.fn().mockReturnValueOnce(questionsMock[0]);
      CompetenceQuestionModel.findOneAndDelete = jest.fn().mockReturnValueOnce(payload);
    })
    it('responds with success when try delete relation between question and competence', async () => {
      const response = await request(app).delete('/questions/123/competences/456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Delete relation with success'});
    });

    it('responds with 404 status if competence not found', async () => {
      CompetenceModel.findById = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).delete('/questions/123/competences/nonexistentcompetence_id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Competence not found' });
    });

    it('responds with 404 status if question not found', async () => {
      QuestionModel.findById = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).delete('/questions/nonexistentquestion_id/competences/456');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Question not found' });
    });

    it('responds with 404 status if relation not found', async () => {
      CompetenceQuestionModel.findOneAndDelete = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).delete('/questions/123/competences/456');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Relation not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      CompetenceQuestionModel.findOneAndDelete = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).delete('/questions/123/competences/456');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });
});