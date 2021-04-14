import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { Word } from './words/entities/word.entity';

@Injectable()
export class AppService {
  async getAlphabet(): Promise<Object[]> {

    const alphabetBasedOnWords = await getConnection()
      .createQueryBuilder()
      .select('UPPER(LEFT(word.name,1))', 'letter')
      .distinctOn(['letter'])
      .from(Word, 'word')
      .orderBy('letter', 'ASC')
      .getRawMany()
      
    return alphabetBasedOnWords
  }
}
