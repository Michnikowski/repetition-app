import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { WordsService } from 'src/words/words.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, WordsService],
})
export class AdminModule {}
