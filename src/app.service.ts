import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Letters, AlphabetBasedOnWords } from './interfaces/letter';
import { Word } from './words/entities/word.entity';

@Injectable()
export class AppService {
  async getAlphabet(): Promise<AlphabetBasedOnWords> {
    const alphabetBasedOnWords: Letters = await getConnection()
      .createQueryBuilder()
      .select('UPPER(LEFT(word.name,1))', 'letter')
      .distinctOn(['letter'])
      .from(Word, 'word')
      .orderBy('letter', 'ASC')
      .getRawMany();

    return { letters: alphabetBasedOnWords };
  }
}
