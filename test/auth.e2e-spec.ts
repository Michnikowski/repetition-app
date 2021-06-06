import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { getConnection } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { join } from 'path';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { createUser } from './factories/user.factory';

describe('AuthController (e2e)', () => {
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
        AuthModule,
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

  describe('#login', () => {
    it('login path correctness', async () => {
      request(app.getHttpServer()).get('/users/login').expect(HttpStatus.OK);
    });

    it('should login', async () => {
      await createUser({
        firstName: 'Obi',
        lastName: 'Brown',
        email: 'Obi.Brown@email.com',
        pwdHash:
          'c2c390685ac0295bc10ddc9538a5c69b380d5ced94604daa7cb875a9376563af5a80f5be5440ceb16bb4b1691411b1efea8f666b164c0b3c00cde7b706e6ae28',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ email: 'Obi.Brown@email.com', pwd: 'password' });

      expect(response.status).toEqual(HttpStatus.FOUND);
      expect(response.header.location).toEqual('/');

      const user = await User.findOne({ email: 'Obi.Brown@email.com' });

      expect(user.currentTokenId).toBeTruthy;
    });

    it(`shouldn't login with wrong password`, async () => {
      await createUser({
        firstName: 'Ryan',
        lastName: 'Dan',
        email: 'Ryan.Dan@email.com',
        pwdHash:
          'c2c390685ac0295bc10ddc9538a5c69b380d5ced94604daa7cb875a9376563af5a80f5be5440ceb16bb4b1691411b1efea8f666b164c0b3c00cde7b706e6ae28',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ email: 'Ryan.Dan@email.com', pwd: 'wrongpassword' });

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);

      const user = await User.findOne({ email: 'Ryan.Dan@email.com' });

      expect(user.currentTokenId).toBeFalsy;
    });

    it(`shouldn't login with wrong email`, async () => {
      await createUser({
        firstName: 'Mark',
        lastName: 'White',
        email: 'Mark.White@email.com',
        pwdHash:
          'c2c390685ac0295bc10ddc9538a5c69b380d5ced94604daa7cb875a9376563af5a80f5be5440ceb16bb4b1691411b1efea8f666b164c0b3c00cde7b706e6ae28',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ email: 'Mark.Brown@email.com', pwd: 'password' });

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);

      const user = await User.findOne({ email: 'Mark.White@email.com' });

      expect(user.currentTokenId).toBeFalsy;
    });

    it(`shouldn't login with empty login and password`, async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ email: '', pwd: '' });

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({
        statusCode: 400,
        message: ['email must be an email', 'pwd should not be empty'],
        error: 'Bad Request',
      });
    });
  });

  describe('#logout', () => {
    it('should logout user', async () => {
      await createUser({
        firstName: 'Linda',
        lastName: 'Lopez',
        email: 'Linda.Lopez@email.com',
        pwdHash:
          'c2c390685ac0295bc10ddc9538a5c69b380d5ced94604daa7cb875a9376563af5a80f5be5440ceb16bb4b1691411b1efea8f666b164c0b3c00cde7b706e6ae28',
        currentTokenId: 'currenttokenid',
      });

      const responseLogout = await request(app.getHttpServer()).get(
        '/auth/logout',
      );

      expect(responseLogout.status).toEqual(HttpStatus.FOUND);
      expect(responseLogout.header.location).toEqual('/users/login');

      const user = await User.findOne({ email: 'Linda.Lopez@email.com' });

      expect(user.currentTokenId).toBeFalsy;
    });
  });
});
