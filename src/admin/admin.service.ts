import { Injectable } from '@nestjs/common';
import { Word } from 'src/words/entities/word.entity';
import { getConnection, IsNull } from 'typeorm';
import { updateWords } from './update-words';

@Injectable()
export class AdminService {
  async updateWordDefinitions() {
    const words: Word[] = await getConnection()
      .createQueryBuilder(Word, 'word')
      .orderBy('word.name', 'ASC')
      .getMany();

    updateWords(words)
  }

  async addMissingWordDefinitions() {
    const words: Word[] = await getConnection()
      .createQueryBuilder(Word, 'word')
      .leftJoin('word.wordFunctions', 'wordFunction')
      .where('wordFunction.id is null')
      .orderBy('word.name', 'ASC')
      .getMany();

    updateWords(words)
  }

}
