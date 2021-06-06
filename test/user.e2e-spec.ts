import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { getConnection } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { join } from 'path';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { createUser } from './factories/user.factory';

describe('UsersController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: ['.env.e2e'] }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST_TEST,
          port: parseInt(process.env.POSTGRES_PORT_TEST, 10),
          username: process.env.POSTGRES_USER_TEST,
          password: process.env.POSTGRES_PASSWORD_TEST,
          database: process.env.POSTGRES_DB_TEST,
          entities: [__dirname + '/../**/**.entity{.ts,.js}'],
          synchronize: true,
          logging: true,
          autoLoadEntities: true,
        }),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    hbs.registerPartials(join(__dirname, '..', 'views/partials'));
    hbs.registerHelper('replaceSpaces', function (input) {
      return input.replace(' ', '');
    });
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    await getConnection().getRepository(User).delete({});
    await app.close();
  });

  describe('#register', () => {
    it('registers path correctness', async () => {
      request(app.getHttpServer()).get('/users/register').expect(HttpStatus.OK);
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
