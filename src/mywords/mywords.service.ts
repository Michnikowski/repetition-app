import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { getPagination, getPaginationPages } from 'src/utils/pagination';
import { Status, UserWord, WordLevel } from 'src/words/entities/user-word.entity';
import { Word } from 'src/words/entities/word.entity';
import { createQueryBuilder, getConnection, Not } from 'typeorm';

@Injectable()
export class MywordsService {

  async findAllUserWords(user: User, pageNumber: number = 1): Promise<Object> {
    const maxPerPage = 48;

    const [userWords, count] = await createQueryBuilder('Word', 'word')
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
    const word = await createQueryBuilder('Word', 'word')
      .leftJoinAndSelect('word.wordFunctions', 'wordFunction')
      .leftJoinAndSelect('wordFunction.definitions', 'definition')
      .leftJoinAndSelect('wordFunction.examples', 'example')
      .where(`word.id = '${body.id}'`)
      .getOne()

    return word
  }

  async deleteUserWord(user: User, wordId: string) {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(UserWord)
      .where("wordId = :wordId", { wordId })
      .andWhere("userId = :userId", { userId: `${user.id}` })
      .execute();
  }

  async appendRandomWords(user: User): Promise<Object> {
    const userWordIds = await createQueryBuilder('Word', 'word')
      .select('word.id')
      .innerJoin('word.userWords', 'userWords')
      .where(`userWords.userId = '${user.id}'`)
      .getMany()

    const userWordIdsArray: Array<string> = [];

    for (const word of userWordIds) {
      userWordIdsArray.push(word['id'])
    }

    let wordsToAdd: Object[]

    if (userWordIdsArray.length > 0){
      wordsToAdd = await createQueryBuilder('Word', 'word')
        .where('word.id NOT IN (:...ids)', { ids: userWordIdsArray })
        .orderBy('random()', 'ASC')
        .take(10)
        .getMany()
    } else {
      wordsToAdd = await createQueryBuilder('Word', 'word')
        .orderBy('random()', 'ASC')
        .take(10)
        .getMany()
    }

    const inputDate: Date = new Date();

    for (const word of wordsToAdd) {
      const singleWord = await Word.findOne(word['id'])
      const userWord = new UserWord();
      userWord.wordStatus = Status.ACTIVE;
      userWord.lastUpdatedDate = inputDate;
      userWord.repetitionDate = inputDate;
      userWord.wordLevel = WordLevel.ZERO;
      userWord.word = singleWord;
      userWord.user = user;
      await userWord.save();
    }

    return {
      words: wordsToAdd
    }
  }

}
