import { Module } from '@nestjs/common';
import { RepetitionsService } from './repetitions.service';
import { RepetitionsController } from './repetitions.controller';

@Module({
  controllers: [RepetitionsController],
  providers: [RepetitionsService]
})
export class RepetitionsModule {}
