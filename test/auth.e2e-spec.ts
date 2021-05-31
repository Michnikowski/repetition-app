import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { getConnection } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from 'src/users/dto/register.dto';
import * as request from 'supertest';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

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
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().getRepository(User).delete({});
    await app.close();
  });

  describe('#register', () => {
    it('registers user', async () => {
      const user: RegisterDto = {
        firstName: 'Jon',
        lastName: 'Doe',
        email: 'Jon.Doe@email.com',
        pwd: 'password',
      };

      const response = await request(app.getHttpServer())
        .post('/users/register')
        .set('Accept', 'application/json')
        .send(user);

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual('/users/login');

      const createdUser = await User.findOne({ email: 'Jon.Doe@email.com' });

      //TODO: mock user password
      expect(createdUser).toMatchObject({
        firstName: 'Jon',
        lastName: 'Doe',
        email: 'Jon.Doe@email.com',
        pwdHash:
          'c2c390685ac0295bc10ddc9538a5c69b380d5ced94604daa7cb875a9376563af5a80f5be5440ceb16bb4b1691411b1efea8f666b164c0b3c00cde7b706e6ae28',
      });
    });
  });
});
