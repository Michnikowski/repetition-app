import { Test, TestingModule } from '@nestjs/testing';
import { MywordsService } from './mywords.service';

describe('MywordsService', () => {
  let service: MywordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MywordsService],
    }).compile();

    service = module.get<MywordsService>(MywordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
