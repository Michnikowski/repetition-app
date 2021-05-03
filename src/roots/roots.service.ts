import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Status, UserWord } from 'src/words/entities/user-word.entity';
import { Word } from 'src/words/entities/word.entity';
import { createQueryBuilder, getConnection } from 'typeorm';
import { WordRoot } from './entities/word-root.entity';

@Injectable()
export class RootsService {
  async getRootWords(): Promise<Object[]> {

    const rootWords = await createQueryBuilder('WordRoot', 'wordRoot')
      .leftJoin('wordRoot.words', 'word')
      .select('wordRoot.name, wordRoot.meaning, wordRoot.id')
      .addSelect("COUNT(word.id) as word_count")
      .groupBy('wordRoot.id')
      .orderBy("TRANSLATE(wordRoot.name, '-', '')", 'ASC')
      .getRawMany()

    return rootWords
  }

  async getWordsByRoot(wordRoot: string, user: User,  rootId: string): Promise<Object> {
    const words = await createQueryBuilder('Word', 'word')
      .leftJoin('word.wordRoots', 'wordRoot')
      .leftJoinAndSelect('word.userWords', 'userWord')
      .leftJoinAndSelect('userWord.user', 'user')
      .where('wordRoot.id = :id', {id: `${rootId}`})
      .orderBy('LOWER(word.name)', 'ASC')
      .getMany()

    const wordsByRoot = words.map(item => {

      const userWords = item['userWords']
      let addWord: boolean = true

      for (const userWord of userWords) {
        if (userWord.user.id === user.id) {
          addWord = false;
          break;
        }
      }

      delete item['userWords']
      item['addWord'] = addWord

      return item
    })

    const wordRootMeaning = await WordRoot.findOne(rootId)

    return {
      words: wordsByRoot,
      wordRoot,
      wordRootMeaning,
    };
  }

  async addWordToUser(wordRoot: string, wordId: string, user: User, rootId: string): Promise<Object> {

    const word = await Word.findOne(wordId)

    const userWord = new UserWord();
    userWord.wordStatus = Status.ACTIVE
    userWord.lastUpdatedDate = new Date();
    userWord.word = word;
    userWord.user = user;
    await userWord.save();

    return await this.getWordsByRoot(wordRoot, user, rootId);
  }

  async deleteUserWord(wordRoot: string, wordId: string, user: User, rootId: string): Promise<Object> {

    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(UserWord)
      .where("wordId = :wordId", {wordId: `${wordId}`})
      .andWhere("userId = :userId", {userId: `${user.id}`})
      .execute();

    return await this.getWordsByRoot(wordRoot, user, rootId)
  }

}
