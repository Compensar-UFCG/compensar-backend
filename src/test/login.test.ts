import request from 'supertest';
import router from '../routes/login.routes';
import usersMock from "./mocks/usersMock.json";
import express from 'express';
import UserModel from '../models/user.model';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

jest.mock('../models/user.model');
jest.mock('jsonwebtoken');

const payload = { username: usersMock[0].username, email: usersMock[0].email, password: "#Aa12345" }

describe('Login Routes - API requests success and erros', () => {
  describe('POST /login/', () => {
    beforeEach(() => {
      UserModel.findOne = jest.fn().mockReturnValueOnce(usersMock[0]);
      jwt.sign = jest.fn().mockReturnValueOnce('VALID_TOKEN');
    });

    it('responds with success login', async () => {
      const response = await request(app).post('/login').send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ token: 'VALID_TOKEN' });
    });

    it('responds with invalid credential when not found user', async () => {
      UserModel.findOne = jest.fn().mockReturnValueOnce(undefined);
      const response = await request(app).post('/login').send(payload);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Credenciais inválidas');
    });

    it('responds with 500 status if an error occurs', async () => {
      UserModel.findOne = jest.fn().mockRejectedValue(new Error('Internal Server Error'));
      const response = await request(app).post('/login').send(payload);

      expect(response.status).toBe(500);
      expect(response.body.message).toEqual('Internal Server Error');
    });

    it('responds with invalid credential when add a wrong password', async () => {
      payload.password = "#Invalid123"
      const response = await request(app).post('/login').send(payload);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Credenciais inválidas');
    });
  });
});
