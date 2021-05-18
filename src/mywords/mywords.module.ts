import { Module } from '@nestjs/common';
import { MywordsService } from './mywords.service';
import { MywordsController } from './mywords.controller';

@Module({
  controllers: [MywordsController],
  providers: [MywordsService],
})
export class MywordsModule {}
