import { Injectable } from '@nestjs/common';
import { ActionType, Log } from 'src/users/entities/log.entity';
import { User } from 'src/users/entities/user.entity';
import { getPagination, getPaginationPages } from 'src/utils/pagination';
import { Status, UserWord, RepetitionTime } from 'src/words/entities/user-word.entity';
import { Word } from 'src/words/entities/word.entity';
import { getConnection } from 'typeorm';

@Injectable()
export class MywordsService {

  async findAllUserWords(user: User, pageNumber: number = 1): Promise<Object> {
    const maxPerPage = 48;

    const [userWords, count] = await Word.createQueryBuilder('word')
      .innerJoin('word.userWords', 'userWords')
      .where(`userWords.userId = '${user.id}'`)
      .orderBy('word.name', 'ASC')
      .skip(maxPerPage * (pageNumber - 1))
      .take(maxPerPage)
      .getManyAndCount()

    const pagesCount = Math.ceil(count / maxPerPage)

    const pages: object[] = getPaginationPages(pagesCount, pageNumber)

    const pagination: object = getPagination(pagesCount, pageNumber)

    return {
      words: userWords,
      pages: pages,
      pagination: pagination,
      randomWords: true,
    };
  }

  async findSingleWord(body): Promise<Object> {
    const word = await Word.createQueryBuilder( 'word')
      .leftJoinAndSelect('word.wordFunctions', 'wordFunction')
      .leftJoinAndSelect('wordFunction.definitions', 'definition')
      .leftJoinAndSelect('wordFunction.examples', 'example')
      .where(`word.id = '${body.id}'`)
      .getOne()

    return word
  }

  async deleteUserWord(user: User, wordId: string) {
    const word = await Word.findOne(wordId)

    const currentWordRepetitionTime = await UserWord.createQueryBuilder('userWord')
      .select('userWord.repetitionTime')
      .where("userWord.wordId = :wordId", {wordId: `${wordId}`})
      .andWhere("userWord.userId = :userId", {userId: `${user.id}`})
      .getOne()

    const wordRepetitionTime: string = RepetitionTime[currentWordRepetitionTime.repetitionTime]

    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(UserWord)
      .where("wordId = :wordId", { wordId })
      .andWhere("userId = :userId", { userId: `${user.id}` })
      .execute();

    const log = new Log();
    log.actionDate = new Date();
    log.actionType = ActionType.DELETION;
    log.repetitionTime = RepetitionTime[wordRepetitionTime]
    log.user = user;
    log.word = word;
    await log.save();
  }

  async appendRandomWords(user: User): Promise<Object> {
    const userWordIds = await Word.createQueryBuilder( 'word')
      .select('word.id')
      .innerJoin('word.userWords', 'userWords')
      .where(`userWords.userId = '${user.id}'`)
      .getMany()

    const userWordIdsArray: Array<string> = [];

    for (const word of userWordIds) {
      userWordIdsArray.push(word.id)
    }

    let wordsToAdd: Word[]

    if (userWordIdsArray.length > 0){
      wordsToAdd = await Word.createQueryBuilder('word')
        .where('word.id NOT IN (:...ids)', { ids: userWordIdsArray })
        .orderBy('random()', 'ASC')
        .take(10)
        .getMany()
    } else {
      wordsToAdd = await Word.createQueryBuilder( 'word')
        .orderBy('random()', 'ASC')
        .take(10)
        .getMany()
    }

    const inputDate: Date = new Date();

    for (const word of wordsToAdd) {
      const singleWord = await Word.findOne(word.id)
      const userWord = new UserWord();

      userWord.wordStatus = Status.ACTIVE;
      userWord.lastUpdatedDate = inputDate;
      userWord.repetitionDate = inputDate;
      userWord.repetitionTime = RepetitionTime.IMMEDIATELLY;
      userWord.word = singleWord;
      userWord.user = user;
      await userWord.save();

      const log = new Log();
      log.actionDate = inputDate;
      log.actionType = ActionType.ADDITION_BY_RANDOM;
      log.repetitionTime = RepetitionTime.IMMEDIATELLY;
      log.user = user;
      log.word = singleWord;
      await log.save();
    }

    return {
      words: wordsToAdd
    }
  }

}
