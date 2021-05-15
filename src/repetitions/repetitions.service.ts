import { Injectable } from '@nestjs/common';
import { ActionType, Log } from 'src/users/entities/log.entity';
import { User } from 'src/users/entities/user.entity';
import { RepetitionTime, Status, UserWord } from 'src/words/entities/user-word.entity';
import { Word } from 'src/words/entities/word.entity';
import { UpdateUserWordDto } from './dto/update_user_word.dto';
import { addDays, format } from 'date-fns'
import { RepetitionTimeButtons } from './dto/repetition_time.dto';
@Injectable()
export class RepetitionsService {
  async getTodayUserWord(user: User): Promise<Object> {
    const tomorrow: Date = new Date(format(addDays(new Date(), 1),"yyyy-MM-dd"))

    const repetitionWord = await Word.createQueryBuilder('word')
      .leftJoinAndSelect('word.userWords', 'userWord')
      .leftJoin('userWord.user', 'user')
      .leftJoinAndSelect('word.wordFunctions', 'wordFunction')
      .leftJoinAndSelect('wordFunction.definitions', 'definition')
      .leftJoinAndSelect('wordFunction.examples', 'example')
      .where('userWord.userId = :userId', {userId: user.id})
      .andWhere('userWord.repetitionDate < :repetitionDate', {repetitionDate: tomorrow})
      .andWhere('userWord.wordStatus = :wordStatus', {wordStatus: Status.ACTIVE})
      .orderBy('random()', 'ASC')
      .getOne()

    if (!repetitionWord) return {
      noWordsToRepetition: "All done today!!! See you tomorrow."
    }

    const wordRepetitionTime: number = repetitionWord.userWords[0].repetitionTime

    const repetitionTime = this.getRepetitionTimeObject(wordRepetitionTime)

    const wordId: string = repetitionWord.id

    const word = await Word.findOne(wordId)

    const log = new Log();
    log.actionDate = new Date();
    log.actionType = ActionType.SHOWING_IN_TODAY_WORDS;
    log.repetitionTime = RepetitionTime[RepetitionTime[wordRepetitionTime]]
    log.user = user;
    log.word = word;
    await log.save();

    repetitionTime.map((item) => {
      item['wordId'] = wordId
    })

    delete repetitionWord.userWords

    return {
      repetitionWord,
      repetitionTime,
      wordId: wordId
    }
  }

  async updateUserWord(user: User, body: UpdateUserWordDto) {
    const word = await Word.findOne(body.wordId)

    const lastUpdatedDate: Date = new Date();

    const userWord = await UserWord.createQueryBuilder('userWord')
      .where("userWord.wordId = :wordId", {wordId: `${body.wordId}`})
      .andWhere("userWord.userId = :userId", {userId: `${user.id}`})
      .getOne()

    const log = new Log();
    log.actionDate = lastUpdatedDate;
    log.repetitionTime = RepetitionTime[body.repetitionTime];
    log.user = user;
    log.word = word;

    if (RepetitionTime[body.repetitionTime] > userWord.repetitionTime) {
      log.actionType = ActionType.LEVEL_UP;
    } else if (RepetitionTime[body.repetitionTime] < userWord.repetitionTime) {
      log.actionType = ActionType.LEVEL_DOWN;
    } else {
      log.actionType = ActionType.LEVEL_NO_CHANGE;
    }

    await log.save();

    const userWordToUpdate = await UserWord.findOne(userWord.id)

    const newRepetitionDate: Date = new Date(format(addDays(new Date(), RepetitionTime[body.repetitionTime]),"yyyy-MM-dd"))

    userWordToUpdate.lastUpdatedDate = lastUpdatedDate;
    userWordToUpdate.repetitionTime = RepetitionTime[body.repetitionTime];
    userWordToUpdate.repetitionDate = newRepetitionDate

    if (RepetitionTime[body.repetitionTime] === 60 && userWord.repetitionTime === 60) {
      userWordToUpdate.wordStatus = Status.INACTIVE;
    }

    await userWordToUpdate.save();

  }

  getRepetitionTimeObject(repetitionTime: number): RepetitionTimeButtons {
    if (repetitionTime === 0) {
      return [
        {
          "repetitionTime": "IMMEDIATELLY",
          "btn": "btn-outline-primary",
          "buttonDescription": "Today",
          "repeat": true
        },
        {
          "repetitionTime": "TOMORROW",
          "btn": "btn-outline-success",
          "buttonDescription": "Tomorrow",
          "arrowUp": true
        }
      ]
    }

    if (repetitionTime === 1) {
      return [
        {
          "repetitionTime": "IMMEDIATELLY",
          "btn": "btn-outline-danger",
          "buttonDescription": "Today",
          "arrowDown": true
        },
        {
          "repetitionTime": "TOMORROW",
          "btn": "btn-outline-primary",
          "buttonDescription": "Tomorrow",
          "repeat": true
        },
        {
          "repetitionTime": "IN_THREE_DAYS",
          "btn": "btn-outline-success",
          "buttonDescription": "In 3 days",
          "arrowUp": true
        }
      ]
    }

    if (repetitionTime === 3) {
      return [
        {
          "repetitionTime": "TOMORROW",
          "btn": "btn-outline-danger",
          "buttonDescription": "Tomorrow",
          "arrowDown": true
        },
        {
          "repetitionTime": "IN_THREE_DAYS",
          "btn": "btn-outline-primary",
          "buttonDescription": "In 3 days",
          "repeat": true
        },
        {
          "repetitionTime": "IN_SEVEN_DAYS",
          "btn": "btn-outline-success",
          "buttonDescription": "In 7 days",
          "arrowUp": true
        }
      ]
    }

    if (repetitionTime === 7) {
      return [
        {
          "repetitionTime": "IN_THREE_DAYS",
          "btn": "btn-outline-danger",
          "buttonDescription": "In 3 days",
          "arrowDown": true
        },
        {
          "repetitionTime": "IN_SEVEN_DAYS",
          "btn": "btn-outline-primary",
          "buttonDescription": "In 7 days",
          "repeat": true
        },
        {
          "repetitionTime": "IN_FOURTEEN_DAYS",
          "btn": "btn-outline-success",
          "buttonDescription": "In 14 days",
          "arrowUp": true
        }
      ]
    }

    if (repetitionTime === 14) {
      return [
        {
          "repetitionTime": "IN_SEVEN_DAYS",
          "btn": "btn-outline-danger",
          "buttonDescription": "In 7 days",
          "arrowDown": true
        },
        {
          "repetitionTime": "IN_FOURTEEN_DAYS",
          "btn": "btn-outline-primary",
          "buttonDescription": "In 14 days",
          "repeat": true
        },
        {
          "repetitionTime": "IN_SIXTY_DAYS",
          "btn": "btn-outline-success",
          "buttonDescription": "In 60 days",
          "arrowUp": true
        }
      ]
    }

    if (repetitionTime === 60) {
      return [
        {
          "repetitionTime": "IN_FOURTEEN_DAYS",
          "btn": "btn-outline-danger",
          "buttonDescription": "In 14 days",
          "arrowDown": true
        },
        {
          "repetitionTime": "IN_SIXTY_DAYS",
          "btn": "btn-outline-success",
          "buttonDescription": "Don't repeat anymore",
          "wink": true
        }
      ]
    }
  }


}
