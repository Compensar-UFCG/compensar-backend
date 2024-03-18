import request from 'supertest';
import router from '../routes/user.routes';
import usersMock from "./mocks/usersMock.json";
import express from 'express';
import UserModel from '../models/user.model';
import bodyParser from 'body-parser';
import { userErrorMessages } from '../utils/users.validation';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

jest.mock('../models/user.model');

const payload = {...usersMock[0], password: "#Aa12345" }
describe('User Routes - API requests success and erros', () => {
  beforeEach(() => {
    UserModel.find = jest.fn().mockReturnValueOnce(usersMock);
    UserModel.findById = jest.fn().mockReturnValueOnce(usersMock[0]);
    UserModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(usersMock[0]);
    UserModel.findByIdAndDelete = jest.fn().mockReturnValueOnce(usersMock[0]);
  });

  describe('GET /users', () => {
    it('responds with json array of users', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(usersMock);
    });

    it('responds with 500 status if an error occurs', async () => {
      UserModel.find = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).get('/users');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });

    it('responds with 500 status and default error message when no pass a error message', async () => {
      UserModel.find = jest.fn().mockRejectedValue(new Error());

      const response = await request(app).get('/users');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Interner Server Error' });
    });
  });

  describe('GET /users/:id', () => {
    it('responds with json user data', async () => {
      const response = await request(app).get('/users/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(usersMock[0]);
    });

    it('responds with 404 status if user not found', async () => {
      UserModel.findById = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).get('/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      UserModel.findById = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).get('/users/123');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });

  describe('POST /users/', () => {

    it('responds with json user data', async () => {
      const mockSaveUser = jest.spyOn(new UserModel(), 'save')
      mockSaveUser.mockImplementation(jest.fn().mockReturnValueOnce(usersMock[0]));

      const response = await request(app).post('/users').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: `Created '${payload.username}' with success` });
    });

    it('responds with 500 status if an error occurs', async () => {
      const mockSaveUser = jest.spyOn(new UserModel(), 'save')
      mockSaveUser.mockImplementation(jest.fn().mockRejectedValue(new Error('Internal Server Error')));

      const response = await request(app).post('/users').send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });

    it('responds with exist user account with this email', async () => {
      const mockSaveUser = jest.spyOn(new UserModel(), 'save')
      mockSaveUser.mockImplementation(jest.fn().mockRejectedValue({ message: `E11000 duplicate key error collection: test.users index: username_1 dup key`, keyValue: { email: payload.email}}));

      const response = await request(app).post('/users').send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: `Exist user with: ${payload.email}` });
    });

    it('responds with exist user account with this username', async () => {
      const mockSaveUser = jest.spyOn(new UserModel(), 'save')
      mockSaveUser.mockImplementation(jest.fn().mockRejectedValue({ message: `E11000 duplicate key error collection: test.users index: username_1 dup key`, keyValue: { username: payload.username}}));

      const response = await request(app).post('/users').send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: `Exist user with: ${payload.username}` });
    });
  });
  describe('PUT /users/:id', () => {
    it('responds with json user data', async () => {
      const response = await request(app).put('/users/123').send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: `Updated '${payload.username}' with success` });
    });

    it('responds with 404 status if user not found', async () => {
      UserModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).put('/users/nonexistent_id').send(payload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      UserModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).put('/users/123').send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });

    it('responds with exist user account with this email', async () => {
      UserModel.findByIdAndUpdate = jest.fn().mockRejectedValue({ message: `E11000 duplicate key error collection: test.users index: username_1 dup key`, keyValue: { email: payload.email}});

      const response = await request(app).put('/users/123').send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: `Exist user with: ${payload.email}` });
    });

    it('responds with exist user account with this username', async () => {
      UserModel.findByIdAndUpdate = jest.fn().mockRejectedValue({ message: `E11000 duplicate key error collection: test.users index: username_1 dup key`, keyValue: { username: payload.username}});

      const response = await request(app).put('/users/123').send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: `Exist user with: ${payload.username}` });
    });
  });

  describe('DELETE /users/:id', () => {
    it('responds with json user data', async () => {
      const response = await request(app).delete('/users/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: `Delete user '${usersMock[0].username}' with success`});
    }, 12);

    it('responds with 404 status if user not found', async () => {
      UserModel.findByIdAndDelete = jest.fn().mockReturnValueOnce(undefined);

      const response = await request(app).delete('/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('responds with 500 status if an error occurs', async () => {
      UserModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).delete('/users/123');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ message: 'Internal Server Error' });
    });
  });
});

describe('User Routes - sanitization and validation body errors', () => {
  describe('PUT /users/:id', () => {
    beforeEach(() => {
      UserModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce(usersMock[0]);
    });
    it('update a user with empty payload and API return error', async () => {
      const payload = {}
      const response = await request(app).put('/users/123').send(payload);
      
      expect(response.status).toBe(422);
      expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
      expect(response.body.message).toContain(userErrorMessages.usernameLength);
      expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
      expect(response.body.message).toContain(userErrorMessages.emailEmpty);
      expect(response.body.message).toContain(userErrorMessages.emailInvalid);
      expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
      expect(response.body.message).toContain(userErrorMessages.passwordLength);
      expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
    });

    it('update a user without name and API return success', async () => {
      const payload = {
        username: "test.username",
        email: "email.test@gmail.com",
        password: "#Aa12345"
      }
      const response = await request(app).put('/users/123').send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: `Updated '${payload.username}' with success` });
    })

    it('update a user and sanitization body and API return success', async () => {
      const payload = {
        name: " test ",
        username: " 123 ",
        email: " email.test@gmail.com ",
        password: " #Aa12345 "
      }
      const response = await request(app).put('/users/123').send(payload);

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual(`Updated '${usersMock[0].username}' with success`)

      expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
      expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
      expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
      expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
      expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
      expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
      expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
      expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
    });

    describe('username rules', () => {
      it('update a user without username and API return error', async () => {
        const payload = {
          name: "test",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
        expect(response.status).toBe(422);
        expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
      it('update a user with username empty and API return error', async () => {
        const payload = {
          name: "test",
          username: "",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with username with whitespace and API return error', async () => {
        const payload = {
          name: "test",
          username: "   ",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
      it('update a user with username without the minimum character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "12",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with the username with the minimum character limit and API return success', async () => {
        const payload = {
          name: "test",
          username: "123",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${usersMock[0].username}' with success`)

        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with username without the maximium character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "UsernameWithleng",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with the username with the maximium character limit and API return success', async () => {
        const payload = {
          name: "test",
          username: "UsernameWithlen",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual(`Updated '${usersMock[0].username}' with success`)

        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with the username with whitespace in a middle the text and API return error', async () => {
        const payload = {
          name: "test",
          username: "Username has WS",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
    })

    describe('email rules', () => {
      it('update a user without email and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with empty email and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with email has just whitespace and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "  ",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with invalid email and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "test",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with email without domain and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "test@",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with email without name and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "@test.com",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with email finish with dot and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "test@test.",
          password: "#Aa12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
    });
    
    describe('password rules', () => {
      it('update a user without password and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
      it('update a user with password empty and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: ""
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with password with whitespace and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "  "
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with password without the minimum character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$S12345"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with password without the maximium character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$S12345688910"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with password without the letters and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$1234567"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with password without the capital letter and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$abcdefg1"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with password without the numbers and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$abcdefg"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });

      it('update a user with password without the special characters and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "abcdefg1"
        }
        const response = await request(app).put('/users/123').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
    })

  });

  describe('POST /users', () => {
    beforeEach(() => {
      const mockSaveUser = jest.spyOn(new UserModel(), 'save')
      mockSaveUser.mockImplementation(jest.fn().mockReturnValueOnce(usersMock[0]));
    });
    it('create a new user with empty payload and API return error', async () => {
      const payload = {}
      const response = await request(app).post('/users').send(payload);
      
      expect(response.status).toBe(422);
      expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
      expect(response.body.message).toContain(userErrorMessages.usernameLength);
      expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
      expect(response.body.message).toContain(userErrorMessages.emailEmpty);
      expect(response.body.message).toContain(userErrorMessages.emailInvalid);
      expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
      expect(response.body.message).toContain(userErrorMessages.passwordLength);
      expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
    });
  
    it('create a new user without name and API return success', async () => {
      const payload = {
        username: "test.username",
        email: "email.test@gmail.com",
        password: "#Aa12345"
      }
      const response = await request(app).post('/users').send(payload);
  
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: `Created '${payload.username}' with success` });
    })

    it('create a new user and sanitization body data and API return success', async () => {
      const payload = {
        name: " test ",
        username: " 123 ",
        email: " email.test@gmail.com ",
        password: " #Aa12345 "
      }
      const response = await request(app).post('/users').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toEqual(`Created '${usersMock[0].username}' with success`)

      expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
      expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
      expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
      expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
      expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
      expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
      expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
      expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
    });
  
    describe('username rules', () => {
      it('create a new user without username and API return error', async () => {
        const payload = {
          name: "test",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
        expect(response.status).toBe(422);
        expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
      it('create a new user with username empty and API return error', async () => {
        const payload = {
          name: "test",
          username: "",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with username with whitespace and API return error', async () => {
        const payload = {
          name: "test",
          username: "   ",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
      it('create a new user with username without the minimum character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "12",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with the username with the minimum character limit and API return success', async () => {
        const payload = {
          name: "test",
          username: "123",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${usersMock[0].username}' with success`)
  
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with username without the maximium character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "UsernameWithleng",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with the username with the maximium character limit and API return success', async () => {
        const payload = {
          name: "test",
          username: "UsernameWithlen",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual(`Created '${usersMock[0].username}' with success`)
  
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with the username with whitespace in a middle the text and API return error', async () => {
        const payload = {
          name: "test",
          username: "Username has WS",
          email: "email.test@gmail.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
    })
  
    describe('email rules', () => {
      it('create a new user without email and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with empty email and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with email has just whitespace and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "  ",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with invalid email and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "test",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with email without domain and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "test@",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with email without name and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "@test.com",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with email finish with dot and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "test@test.",
          password: "#Aa12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
    });
    
    describe('password rules', () => {
      it('create a new user without password and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
      it('create a new user with password empty and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: ""
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with password with whitespace and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "  "
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with password without the minimum character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$S12345"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with password without the maximium character limit and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$S12345688910"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).toContain(userErrorMessages.passwordLength);
        expect(response.body.message).not.toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with password without the letters and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$1234567"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with password without the capital letter and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$abcdefg1"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with password without the numbers and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "$abcdefg"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
  
      it('create a new user with password without the special characters and API return error', async () => {
        const payload = {
          name: "test",
          username: "test.username",
          email: "email.test@gmail.com",
          password: "abcdefg1"
        }
        const response = await request(app).post('/users').send(payload);
  
        expect(response.status).toBe(422);
        expect(response.body.message).not.toContain(userErrorMessages.usernameEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.usernameLength);
        expect(response.body.message).not.toContain(userErrorMessages.usernameWhitespace);
        expect(response.body.message).not.toContain(userErrorMessages.emailEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.emailInvalid);
        expect(response.body.message).not.toContain(userErrorMessages.passwordEmpty);
        expect(response.body.message).not.toContain(userErrorMessages.passwordLength);
        expect(response.body.message).toContain(userErrorMessages.passwordInvalid);
      });
    })
  
  });
});