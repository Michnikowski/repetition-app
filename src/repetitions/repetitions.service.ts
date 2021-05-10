import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { createQueryBuilder } from 'typeorm';
@Injectable()
export class RepetitionsService {
  async getTodayUserWord(user: User): Promise<Object> {

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const userWord = await createQueryBuilder('Word', 'word')
      .leftJoinAndSelect('word.userWords', 'userWord')
      .leftJoin('userWord.user', 'user')
      .leftJoinAndSelect('word.wordFunctions', 'wordFunction')
      .leftJoinAndSelect('wordFunction.definitions', 'definition')
      .leftJoinAndSelect('wordFunction.examples', 'example')
      .where('userWord.userId = :userId', {userId: user.id})
      .andWhere('userWord.repetitionDate < :repetitionDate', {repetitionDate: tomorrow})
      .orderBy('userWord.repetitionDate', 'ASC')
      .getOne()

    console.log(userWord)

    return await userWord
  }

}
