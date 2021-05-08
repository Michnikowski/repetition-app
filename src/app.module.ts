import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WordsModule } from './words/words.module';
import { UsersModule } from './users/users.module';
import { RootsModule } from './roots/roots.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { MywordsModule } from './mywords/mywords.module';
import { RepetitionsModule } from './repetitions/repetitions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
    }),
    WordsModule,
    UsersModule,
    RootsModule,
    AdminModule,
    AuthModule,
    MywordsModule,
    RepetitionsModule
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}
