import { Test, TestingModule } from '@nestjs/testing';
import { MywordsController } from './mywords.controller';
import { MywordsService } from './mywords.service';

describe('MywordsController', () => {
  let controller: MywordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MywordsController],
      providers: [MywordsService],
    }).compile();

    controller = module.get<MywordsController>(MywordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
