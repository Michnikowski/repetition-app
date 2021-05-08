import { Test, TestingModule } from '@nestjs/testing';
import { RepetitionsController } from './repetitions.controller';
import { RepetitionsService } from './repetitions.service';

describe('RepetitionsController', () => {
  let controller: RepetitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepetitionsController],
      providers: [RepetitionsService],
    }).compile();

    controller = module.get<RepetitionsController>(RepetitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
