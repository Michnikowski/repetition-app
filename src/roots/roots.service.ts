import { Injectable } from '@nestjs/common';
import { ActionType, Log, RepetitionTime } from 'src/users/entities/log.entity';
import { User } from 'src/users/entities/user.entity';
import { Status, UserWord } from 'src/words/entities/user-word.entity';
import { Word } from 'src/words/entities/word.entity';
import { getConnection } from 'typeorm';
import { WordRoot } from './entities/word-root.entity';

@Injectable()
export class RootsService {
  async getRootWords() {
    const rootWords = await WordRoot.createQueryBuilder('wordRoot')
      .leftJoin('wordRoot.words', 'word')
      .select('wordRoot.name, wordRoot.meaning, wordRoot.id')
      .addSelect('COUNT(word.id) as word_count')
      .groupBy('wordRoot.id')
      .orderBy("TRANSLATE(wordRoot.name, '-', '')", 'ASC')
      .getRawMany();

    return rootWords;
  }

  async getWordsByRoot(wordRoot: string, user: User, rootId: string) {
    const words = await Word.createQueryBuilder('word')
      .leftJoin('word.wordRoots', 'wordRoot')
      .leftJoinAndSelect('word.userWords', 'userWord')
      .leftJoinAndSelect('userWord.user', 'user')
      .where('wordRoot.id = :id', { id: `${rootId}` })
      .orderBy('LOWER(word.name)', 'ASC')
      .getMany();

    const wordsByRoot = words.map((item) => {
      const userWords = item.userWords;
      let addWord = true;

      for (const userWord of userWords) {
        if (userWord.user.id === user.id) {
          addWord = false;
          break;
        }
      }

      delete item.userWords;
      item['addWord'] = addWord;

      return item;
    });

    const wordRootMeaning = await WordRoot.findOne(rootId);

    return {
      words: wordsByRoot,
      wordRoot,
      wordRootMeaning,
    };
  }

  async addWordToUser(
    wordRoot: string,
    wordId: string,
    user: User,
    rootId: string,
  ) {
    const word = await Word.findOne(wordId);

    const inputDate: Date = new Date();

    const userWord = new UserWord();
    userWord.wordStatus = Status.ACTIVE;
    userWord.lastUpdatedDate = inputDate;
    userWord.repetitionDate = inputDate;
    userWord.word = word;
    userWord.user = user;
    await userWord.save();

    const log = new Log();
    log.actionDate = inputDate;
    log.actionType = ActionType.ADDITION_BY_USER;
    log.repetitionTime = RepetitionTime.IMMEDIATELLY;
    log.user = user;
    log.word = word;
    await log.save();

    return await this.getWordsByRoot(wordRoot, user, rootId);
  }

  async deleteUserWord(
    wordRoot: string,
    wordId: string,
    user: User,
    rootId: string,
  ) {
    const word = await Word.findOne(wordId);

    const currentWordRepetitionTime = await UserWord.createQueryBuilder(
      'userWord',
    )
      .select('userWord.repetitionTime')
      .where('userWord.wordId = :wordId', { wordId: `${wordId}` })
      .andWhere('userWord.userId = :userId', { userId: `${user.id}` })
      .getOne();

    const wordRepetitionTime: string =
      RepetitionTime[currentWordRepetitionTime.repetitionTime];

    const log = new Log();
    log.actionDate = new Date();
    log.actionType = ActionType.DELETION;
    log.repetitionTime = RepetitionTime[wordRepetitionTime];
    log.user = user;
    log.word = word;
    await log.save();

    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(UserWord)
      .where('wordId = :wordId', { wordId: `${wordId}` })
      .andWhere('userId = :userId', { userId: `${user.id}` })
      .execute();

    return await this.getWordsByRoot(wordRoot, user, rootId);
  }
}
