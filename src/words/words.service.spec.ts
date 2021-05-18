import { Test, TestingModule } from '@nestjs/testing';
import { WordsService } from './words.service';

describe('WordsService', () => {
  let service: WordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WordsService],
    }).compile();

    service = module.get<WordsService>(WordsService);
  });

  it('word service should be defined', () => {
    expect(service).toBeDefined();
  });
});
