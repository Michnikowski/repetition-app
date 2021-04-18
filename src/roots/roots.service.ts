import { Injectable } from '@nestjs/common';
import { createQueryBuilder } from 'typeorm';

@Injectable()
export class RootsService {
  async getRootWords(): Promise<Object[]> {

    const rootWords = await createQueryBuilder('WordRoot', 'wordRoot')
      .leftJoin('wordRoot.words', 'word')
      .select('wordRoot.name, wordRoot.meaning')
      .addSelect("COUNT(word.id) as word_count")
      .groupBy('wordRoot.id')
      .orderBy("TRANSLATE(wordRoot.name, '-', '')", 'ASC')
      .getRawMany()

    return rootWords
  }

  async getWordsByRoot(wordRoot: string): Promise<Object> {
    const wordsByRoot = await createQueryBuilder('Word', 'word')
      .leftJoin('word.wordRoots', 'wordRoot')
      .where(`wordRoot.name = '${wordRoot}'`)
      .orderBy('LOWER(word.name)', 'ASC')
      .getMany()

    return {
      words: wordsByRoot,
      wordRoot,
    };
  }

}
