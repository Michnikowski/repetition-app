import { Test, TestingModule } from '@nestjs/testing';
import { RepetitionsService } from './repetitions.service';

describe('RepetitionsService', () => {
  let service: RepetitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepetitionsService],
    }).compile();

    service = module.get<RepetitionsService>(RepetitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
