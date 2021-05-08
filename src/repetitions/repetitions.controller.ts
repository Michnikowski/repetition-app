import { Controller } from '@nestjs/common';
import { RepetitionsService } from './repetitions.service';

@Controller('repetitions')
export class RepetitionsController {
  constructor(private readonly repetitionsService: RepetitionsService) {}


}
