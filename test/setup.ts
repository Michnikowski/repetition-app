import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { join } from 'path';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';

export async function initApp() {
  let app;
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
      AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
  }).compile();

  app = moduleFixture.createNestApplication();

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartial('head', join(__dirname, '..', 'views/partials'));
  hbs.registerHelper('replaceSpaces', function (input) {
    return input.replace(' ', '');
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  await app.init();
  return app;
}
