import request from 'supertest';
import router from '../routes/question.routes';
import questionsMock from "./mocks/questionsMock.json";
import express from 'express';
import QuestionModel from '../models/question.model';
import bodyParser from 'body-parser';
import { questionErrorMessages } from '../utils/questions.validation';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

jest.mock('../models/question.model');

const payload = {...questionsMock[0], password: "#Aa12345" }
describe('Question Routes - API requests success and erros', () => {
  beforeEach(() => {
    QuestionModel.find = jest.fn().mockReturnValueOnce(questionsMock);
    QuestionModel.findById = jest.fn().mockReturnValueOnce(questionsMock[0]);
    QuestionModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(questionsMock[0]);
    QuestionModel.findByIdAndDelete = jest.fn().mockReturnValueOnce(questionsMock[0]);
  });

  describe('GET /questions', () => {
    it('responds with json array of questions', async () => {
      const response = await request(app).get('/questions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(questionsMock);
    });

    it('responds with 500 status if an error occurs', async () => {
      QuestionModel.find = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).get('/questions');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });

    it('responds with 500 status and default error message when no pass a error message', async () => {
      QuestionModel.find = jest.fn().mockRejectedValue(new Error());

      const response = await request(app).get('/questions');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Interner Server Error' });
    });
  });

  describe('GET /questions/:id', () => {
    it('responds with json question data', async () => {
      const response = await request(app).get('/questions/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(questionsMock[0]);
    });

    it('responds with 404 status if question not found', async () => {
      QuestionModel.findById = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).get('/questions/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Question not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      QuestionModel.findById = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).get('/questions/123');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });

  describe('POST /questions/', () => {

    it('responds with json question data', async () => {
      const mockSaveQuestion = jest.spyOn(new QuestionModel(), 'save')
      mockSaveQuestion.mockImplementation(jest.fn().mockReturnValueOnce(questionsMock[0]));

      const response = await request(app).post('/questions').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: `Created '${payload.title}' with success` });
    });

    it('responds with 500 status if an error occurs', async () => {
      const mockSaveQuestion = jest.spyOn(new QuestionModel(), 'save')
      mockSaveQuestion.mockImplementation(jest.fn().mockRejectedValue(new Error('Internal Server Error')));

      const response = await request(app).post('/questions').send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });
  describe('PUT /questions/:id', () => {
    it('responds with json question data', async () => {
      const response = await request(app).put('/questions/123').send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: `Updated '${payload.title}' with success` });
    });

    it('responds with 404 status if question not found', async () => {
      QuestionModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).put('/questions/nonexistent_id').send(payload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Question not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      QuestionModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).put('/questions/123').send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });

  describe('DELETE /questions/:id', () => {
    it('responds with json question data', async () => {
      const response = await request(app).delete('/questions/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: `Delete question '${questionsMock[0].title}' with success`});
    }, 12);

    it('responds with 404 status if question not found', async () => {
      QuestionModel.findByIdAndDelete = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).delete('/questions/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Question not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      QuestionModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).delete('/questions/123');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });
});

describe('Question Routes - sanitization and validation body errors', () => {
  describe('PUT /questions/:id', () => {
    beforeEach(() => {
      QuestionModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(questionsMock[0]);
    });
    it('update a question with empty payload and API return error', async () => {
      const payload = {}
      const response = await request(app).put('/questions/123').send(payload);
      
      expect(response.status).toBe(422);
      expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
      expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
      expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
      expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
      expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
    });

    it('update a question just required values and API return success', async () => {
      const payload = {
        title: "title",
        statement: "statement",
        type: "type",
        font: "enem",
        response: "response",
      }
      const response = await request(app).put('/questions/123').send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: `Updated '${questionsMock[0].title}' with success` });
    })

    it('update a question and sanitization body and API return success', async () => {
      const payload = {
        title: " title ",
        statement: " statement ",
        type: " type ",
        font: " enem ",
        response: " response "
      }
      const response = await request(app).put('/questions/123').send(payload);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);

      expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
    });

    describe('title', () => {
      it('renders error message when try create account without title', async () => {
        const payload = {
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with empty title', async () => {
        const payload = {
          title: "",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with title has whitespace', async () => {
        const payload = {
          title: " ",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with title hasn`t min length ', async () => {
        const payload = {
          title: "12",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleLength);
      });

      it('renders error message when try create account with title pass max length ', async () => {
        const payload = {
          title: "Adding a title with length more than 100 characteres. So returns error message, because the title ...",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleLength);
      });

      it('renders success when add a title with min length', async () => {
        const payload = {
          title: "123",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });

      it('renders success when add a title with max length', async () => {
        const payload = {
          title: "Adding a title with length more than 100 characteres. So returns error message, because the title...",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });
    });

    describe('statement', () => {
      it('renders error message when try create account without statement', async () => {
        const payload = {
          title: "title",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with empty statement', async () => {
        const payload = {
          title: "title",
          statement: "",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with statement has whitespace', async () => {
        const payload = {
          title: "title",
          statement: " ",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
    });

    describe('type', () => {
      it('renders error message when try create account without type', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with empty type', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with type has whitespace', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: " ",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with type hasn`t min length ', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "12",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.typeLength);
      });

      it('renders error message when try create account with type pass max length ', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "Adding a type with length more than 50 characteres!",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.typeLength);
      });

      it('renders success when add a type with min length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "123",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });

      it('renders success when add a type with max length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "Adding a type with length more than 50 characteres",
          font: "enem",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });

    });

    describe('font', () => {
      it('renders error message when try create account without font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with empty font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with font has whitespace', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: " ",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with font hasn`t a valid value', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "another font value",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.fontMacth);
      });

      it('renders success when add valid font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });
    });

    describe('year', () => {
      it('renders error message when try create account with invalid year value', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          year: "1899",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.yearMatch);
      });

      it('renders success when add valid font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          year: "1900",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });

      it('renders success when add valid font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          year: "2000",
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });
    });

    describe('alternatives', () => {
      it('renders error message when try create account with alternatives hasn`t min length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          alternatives: ["one alternative"],
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.alternativesLenght);
      });

      it('renders success when add alternatives with valid length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          alternatives: ["one alternative", "two alternative"],
          response: "response"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });
    });
    describe('response', () => {

      it('renders error message when try create account without response', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with empty response', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: ""
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with response has whitespace', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: " "
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
      });

      it('renders error message when try create account with response pass max length ', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "Adding a response with length more than 100 characteres. So returns error message, because the title!"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.responseLength);
      });

      it('renders success when add a response with max length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "Adding a response with length more than 100 characteres. So returns error message, because the title"
        }
        const response = await request(app).put('/questions/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${questionsMock[0].title}' with success`);
      });
    });
  });

  describe('POST /questions', () => {
    beforeEach(() => {
      const mockSaveQuestion = jest.spyOn(new QuestionModel(), 'save')
      mockSaveQuestion.mockImplementation(jest.fn().mockReturnValueOnce(questionsMock[0]));
    });
    it('create a question with empty payload and API return error', async () => {
      const payload = {}
      const response = await request(app).post('/questions').send(payload);
      
      expect(response.status).toBe(422);
      expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
      expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
      expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
      expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
      expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
    });
  
    it('create a question just required values and API return success', async () => {
      const payload = {
        title: "title",
        statement: "statement",
        type: "type",
        font: "enem",
        response: "response",
      }
      const response = await request(app).post('/questions').send(payload);
  
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: `Created '${questionsMock[0].title}' with success` });
    })
  
    it('create a question and sanitization body and API return success', async () => {
      const payload = {
        title: " title ",
        statement: " statement ",
        type: " type ",
        font: " enem ",
        response: " response "
      }
      const response = await request(app).post('/questions').send(payload);
  
      expect(response.status).toBe(201);
      expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
  
      expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
      expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
    });
  
    describe('title', () => {
      it('renders error message when try create account without title', async () => {
        const payload = {
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with empty title', async () => {
        const payload = {
          title: "",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with title has whitespace', async () => {
        const payload = {
          title: " ",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with title hasn`t min length ', async () => {
        const payload = {
          title: "12",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleLength);
      });
  
      it('renders error message when try create account with title pass max length ', async () => {
        const payload = {
          title: "Adding a title with length more than 100 characteres. So returns error message, because the title ...",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.titleLength);
      });
  
      it('renders success when add a title with min length', async () => {
        const payload = {
          title: "123",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
  
      it('renders success when add a title with max length', async () => {
        const payload = {
          title: "Adding a title with length more than 100 characteres. So returns error message, because the title...",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
    });
  
    describe('statement', () => {
      it('renders error message when try create account without statement', async () => {
        const payload = {
          title: "title",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with empty statement', async () => {
        const payload = {
          title: "title",
          statement: "",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with statement has whitespace', async () => {
        const payload = {
          title: "title",
          statement: " ",
          type: "type",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
    });
  
    describe('type', () => {
      it('renders error message when try create account without type', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with empty type', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with type has whitespace', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: " ",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with type hasn`t min length ', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "12",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.typeLength);
      });
  
      it('renders error message when try create account with type pass max length ', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "Adding a type with length more than 50 characteres!",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.typeLength);
      });
  
      it('renders success when add a type with min length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "123",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
  
      it('renders success when add a type with max length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "Adding a type with length more than 50 characteres",
          font: "enem",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
    });
  
    describe('font', () => {
      it('renders error message when try create account without font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with empty font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with font has whitespace', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: " ",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with font hasn`t a valid value', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "another font value",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.fontMacth);
      });
  
      it('renders success when add valid font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
    });
  
    describe('year', () => {
      it('renders error message when try create account with invalid year value', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          year: "1899",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.yearMatch);
      });
  
      it('renders success when add valid font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          year: "1900",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
  
      it('renders success when add valid font', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          year: "2000",
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
    });
  
    describe('alternatives', () => {
      it('renders error message when try create account with alternatives hasn`t min length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          alternatives: ["one alternative"],
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.alternativesLenght);
      });
  
      it('renders success when add alternatives with valid length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "other",
          alternatives: ["one alternative", "two alternative"],
          response: "response"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
    });
    describe('response', () => {
  
      it('renders error message when try create account without response', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with empty response', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: ""
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with response has whitespace', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: " "
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).not.toContain(questionErrorMessages.titleEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.statementEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.fontEmpty);
        expect(response.body.message).not.toContain(questionErrorMessages.typeEmpty);
        expect(response.body.message).toContain(questionErrorMessages.responseEmpty);
      });
  
      it('renders error message when try create account with response pass max length ', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "Adding a response with length more than 100 characteres. So returns error message, because the title!"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(422);
  
        expect(response.body.message).toContain(questionErrorMessages.responseLength);
      });
  
      it('renders success when add a response with max length', async () => {
        const payload = {
          title: "title",
          statement: "statement",
          type: "type",
          font: "enem",
          response: "Adding a response with length more than 100 characteres. So returns error message, because the title"
        }
        const response = await request(app).post('/questions').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${questionsMock[0].title}' with success`);
      });
    });
  });
});