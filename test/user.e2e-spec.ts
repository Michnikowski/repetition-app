import { HttpStatus } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { createUser } from './factories/user.factory';
import { initApp } from './setup';

describe('UsersController (e2e)', () => {
  let app;

  beforeAll(async () => {
    app = await initApp();
  });

  afterAll(async () => {
    await getConnection().getRepository(User).delete({});
    await app.close();
  });

  describe('#register', () => {
    it('registers path correctness', async () => {
      const response = await request(app.getHttpServer()).get(
        '/users/register',
      );

      expect(response.status).toBe(HttpStatus.OK);
    });

    it('registers user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .set('Accept', 'application/json')
        .send({
          firstName: 'Jon',
          lastName: 'Doe',
          email: 'Jon.Doe@email.com',
          pwd: 'password',
        });

      expect(response.status).toEqual(HttpStatus.FOUND);
      expect(response.header.location).toEqual('/users/login');

      const createdUser = await User.findOne({ email: 'Jon.Doe@email.com' });

      expect(createdUser).toMatchObject({
        firstName: 'Jon',
        lastName: 'Doe',
        email: 'Jon.Doe@email.com',
        pwdHash:
          'c2c390685ac0295bc10ddc9538a5c69b380d5ced94604daa7cb875a9376563af5a80f5be5440ceb16bb4b1691411b1efea8f666b164c0b3c00cde7b706e6ae28',
      });
    });

    it(`doesn't register user if email already exist in db`, async () => {
      await createUser({
        firstName: 'Mark',
        lastName: 'Green',
        email: 'Mark.Green@email.com',
        pwdHash: 'password',
      });

      const response = await request(app.getHttpServer())
        .post('/users/register')
        .set('Accept', 'application/json')
        .send({
          firstName: 'Mark',
          lastName: 'Green',
          email: 'Mark.Green@email.com',
          pwd: 'password',
        });

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    });

    it(`doesn't register user with empty data`, async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .set('Accept', 'application/json')
        .send({
          firstName: '',
          lastName: '',
          email: '',
          pwd: '',
        });

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: [
          'firstName should not be empty',
          'lastName should not be empty',
          'email must be an email',
          'pwd should not be empty',
        ],
        error: 'Bad Request',
      });
    });
  });
});
