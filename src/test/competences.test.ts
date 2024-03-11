import request from 'supertest';
import router from '../routes/competence.routes';
import competencesMock from "./mocks/competencesMock.json";
import express from 'express';
import CompetenceModel from '../models/competence.model';
import bodyParser from 'body-parser';
import { competenceErrorMessages } from '../utils/competences.validation';

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
    CompetenceModel.findByIdAndDelete = jest.fn().mockReturnValueOnce(competencesMock[0]);
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

    it('responds with 500 status and default error message when no pass a error message', async () => {
      CompetenceModel.find = jest.fn().mockRejectedValue(new Error());

      const response = await request(app).get('/competences');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Interner Server Error' });
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

  describe('POST /competences/', () => {

    it('responds with json competence data', async () => {
      const mockSaveCompetence = jest.spyOn(new CompetenceModel(), 'save')
      mockSaveCompetence.mockImplementation(jest.fn().mockReturnValueOnce(competencesMock[0]));

      const payload = competencesMock[0];
      const response = await request(app).post('/competences').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(payload);
    });

    it('responds with 500 status if an error occurs', async () => {
      const mockSaveCompetence = jest.spyOn(new CompetenceModel(), 'save')
      mockSaveCompetence.mockImplementation(jest.fn().mockRejectedValue(new Error('Internal Server Error')));

      const payload = competencesMock[0];
      const response = await request(app).post('/competences').send(payload);

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

  describe('DELETE /competences/:id', () => {
    it('responds with json competence data', async () => {
      const response = await request(app).delete('/competences/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: `Delete competence '${competencesMock[0].title}' with success`});
    }, 100);

    it('responds with 404 status if competence not found', async () => {
      CompetenceModel.findByIdAndDelete = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).delete('/competences/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Competence not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      CompetenceModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).delete('/competences/123');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });
});

describe('Competence Routes - sanitization and validation body errors', () => {
  describe('PUT /competences/:id', () => {
    beforeEach(() => {
      CompetenceModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(competencesMock[0]);
    });
    describe('Title Competence', () => {
      it('return error when try edit a competence with no add title', async () => {
        const payload = { description: "Valid Description" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
      });

      it('return error when try edit a competence with a title empty', async () => {
        const payload = { title: "", description: "Valid Description" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
      });

      it('return error when try edit a competence with a title empty', async () => {
        const payload = { title: "   ", description: "Valid Description" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
      });

      it('return error when try edit a competence title with no length min', async () => {
        const payload = { title: "12", description: "Valid Description" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
      });

      it('return error when try edit a competence title with length more then max', async () => {
        const payload = { title: "I add a new title with more them 100 characters in my unit test to check if returns error when i try!", description: "Valid Description" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
      });

      it('return success when try edit a competence title with length min', async () => {
        const payload = { title: "123", description: "Valid Description" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(200);
      });
      it('return success when try edit a competence title with length max', async () => {
        const payload = { title: "I add a new title with more them 100 characters in my unit test to check if returns error when i try", description: "Valid Description" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(200);
      });
    });

    describe('Description Competence', () => {
      it('return error when try edit a competence with no add description', async () => {
        const payload = { title: "Valid title" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a description empty', async () => {
        const payload = { title: "Valid title", description: "" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a description empty', async () => {
        const payload = { title: "Valid title", description: "   " };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence description with no length min', async () => {
        const payload = { title: "Valid title", description: "12" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });

      it('return error when try edit a competence description with length more then max', async () => {
        const payload = { title: "Valid title", description: "I add a new description with more them 255 characters in my unit test to check if returns error when i try do this! So I add another characters to see if returns an error or not. So, to this I need add to mutch characters in my text. Because, I need know!!" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });

      it('return success when try edit a competence description with length min', async () => {
        const payload = { title: "Valid title", description: "123" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(200);
      });
      it('return success when try edit a competence description with length max', async () => {
        const payload = { title: "Valid title", description: "I add a new description with more them 255 characters in my unit test to check if returns error when i try do this! So I add another characters to see if returns an error or not. So, to this I need add to mutch characters in my text. Because, I need know!"};
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(200);
      });
    });

    describe('Title and Description Competence', () => {
      it('return error when try edit a competence with no add title and no add description', async () => {
        const payload = {};
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a title and description empties', async () => {
        const payload = { title: "", description: "" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a title and description empties', async () => {
        const payload = { title: "   ", description: "   " };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence title and description with no length min', async () => {
        const payload = { title: "12", description: "12" };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });

      it('return error when try edit a competence title and description with length more then max', async () => {
        const payload = {
          title: "I add a new title with more them 100 characters in my unit test to check if returns error when i try!",
          description: "I add a new description with more them 255 characters in my unit test to check if returns error when i try do this! So I add another characters to see if returns an error or not. So, to this I need add to mutch characters in my text. Because, I need know!!"
        };
        const response = await request(app).put('/competences/123').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });
    });
  });

  describe('POST /competences/', () => {
    beforeEach(() => {
      const mockSaveCompetence = jest.spyOn(new CompetenceModel(), 'save')
      mockSaveCompetence.mockImplementation(jest.fn().mockReturnValueOnce(competencesMock[0]));
    })
    describe('Title Competence', () => {
      it('return error when try edit a competence with no add title', async () => {
        const payload = { description: "Valid Description" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
      });

      it('return error when try edit a competence with a title empty', async () => {
        const payload = { title: "", description: "Valid Description" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
      });

      it('return error when try edit a competence with a title empty', async () => {
        const payload = { title: "   ", description: "Valid Description" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
      });

      it('return error when try edit a competence title with no length min', async () => {
        const payload = { title: "12", description: "Valid Description" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
      });

      it('return error when try edit a competence title with length more then max', async () => {
        const payload = { title: "I add a new title with more them 100 characters in my unit test to check if returns error when i try!", description: "Valid Description" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
      });

      it('return success when try edit a competence title with length min', async () => {
        const payload = { title: "123", description: "Valid Description" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(201);
      });
      it('return success when try edit a competence title with length max', async () => {
        const payload = { title: "I add a new title with more them 100 characters in my unit test to check if returns error when i try", description: "Valid Description" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(201);
      });
    });

    describe('Description Competence', () => {
      it('return error when try edit a competence with no add description', async () => {
        const payload = { title: "Valid title" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a description empty', async () => {
        const payload = { title: "Valid title", description: "" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a description empty', async () => {
        const payload = { title: "Valid title", description: "   " };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence description with no length min', async () => {
        const payload = { title: "Valid title", description: "12" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });

      it('return error when try edit a competence description with length more then max', async () => {
        const payload = { title: "Valid title", description: "I add a new description with more them 255 characters in my unit test to check if returns error when i try do this! So I add another characters to see if returns an error or not. So, to this I need add to mutch characters in my text. Because, I need know!!" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });

      it('return success when try edit a competence description with length min', async () => {
        const payload = { title: "Valid title", description: "123" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(201);
      });
      it('return success when try edit a competence description with length max', async () => {
        const payload = { title: "Valid title", description: "I add a new description with more them 255 characters in my unit test to check if returns error when i try do this! So I add another characters to see if returns an error or not. So, to this I need add to mutch characters in my text. Because, I need know!"};
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(201);
      });
    });

    describe('Title and Description Competence', () => {
      it('return error when try edit a competence with no add title and no add description', async () => {
        const payload = {};
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a title and description empties', async () => {
        const payload = { title: "", description: "" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence with a title and description empties', async () => {
        const payload = { title: "   ", description: "   " };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleEmpty);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionEmpty);
      });

      it('return error when try edit a competence title and description with no length min', async () => {
        const payload = { title: "12", description: "12" };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });

      it('return error when try edit a competence title and description with length more then max', async () => {
        const payload = {
          title: "I add a new title with more them 100 characters in my unit test to check if returns error when i try!",
          description: "I add a new description with more them 255 characters in my unit test to check if returns error when i try do this! So I add another characters to see if returns an error or not. So, to this I need add to mutch characters in my text. Because, I need know!!"
        };
        const response = await request(app).post('/competences').send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toMatch(competenceErrorMessages.titleLength);
        expect(response.body.message).toMatch(competenceErrorMessages.descriptionLength);
      });
    });
  });
});