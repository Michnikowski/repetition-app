import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WordsModule } from './words/words.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    WordsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
