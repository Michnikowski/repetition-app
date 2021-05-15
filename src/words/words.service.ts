import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { GetWordsResponse } from './dto/membean.dto';
import { WordRoot } from '../roots/entities/word-root.entity';
import { Word } from './entities/word.entity';
import { createQueryBuilder, getConnection } from 'typeorm';
import { getPagination, getPaginationPages } from 'src/utils/pagination';
import { User } from 'src/users/entities/user.entity';
import { Status, UserWord, RepetitionTime } from './entities/user-word.entity';
import { ActionType, Log } from 'src/users/entities/log.entity';

@Injectable()
export class WordsService {

  async getWords(): Promise<object[]> {
    const browser: puppeteer.Browser = await puppeteer.launch({
      headless: false,
      slowMo: 250,
      devtools: true,
    });

    const page: puppeteer.Page = await browser.newPage();
    await page.goto('https://membean.com/treelist');
    await page.waitForSelector('#treelist');

    const rootForms = await page.$$(`span.rootform > a`);
    const membeanWords: GetWordsResponse = [];

    for ( const rootForm of rootForms ) {
      try {
        await rootForm.click({ delay: 300 });
        await page.waitForSelector('#treepanel');

        page.once('response', async (response) => {

          const dataObject = await response.json()

          let rootForm: string = await dataObject.data.drootform;
          let meaning: string = await dataObject.data.meaning;
          let leafs: object[] = await dataObject.data.leafs;

          membeanWords.push({
            root: rootForm,
            meaning: meaning,
            leafs: leafs
          })
        });

        await page.click('#sb-nav-close')

      } catch(e) {
        console.log(e.message);
      }
    }

    await browser.close();

    for ( let rootWordItem in membeanWords ) {
      let { root, meaning, leafs } = membeanWords[rootWordItem];
      let wordRoot = await WordRoot.findOne({name: root, meaning: meaning} )

      if (!wordRoot) {
        wordRoot = new WordRoot();
        wordRoot.name = root;
        wordRoot.meaning = meaning;
        await wordRoot.save();

      } else {
        if (wordRoot.meaning !== meaning) {
          wordRoot.meaning = meaning;
          await wordRoot.save();
        }
      }

      for (let leaf in leafs) {
        let { inlist, wordform, meaning } = leafs[leaf];

        wordform = wordform
          .replace(/<em>|<\/em>/gi, '');

        meaning = meaning
          .replace(/<em>|<\/em>/gi, '');

        let word = await Word.findOne({
          name: wordform
        })

        if (!word) {
          word = new Word();
          word.name = wordform;
          word.definition = meaning;
          word.membean = inlist;
          word.wordRoots = [wordRoot];
          await word.save();

        } else {
          let wordWithRoot = await Word.createQueryBuilder("word")
            .leftJoinAndSelect("word.wordRoots", "wordRoot")
            .where("word.name = :name", { name: wordform })
            .andWhere("wordRoot.id = :id", { id: wordRoot.id })
            .getOne();

          if (!wordWithRoot) {
            await getConnection()
              .createQueryBuilder()
              .relation(Word, "wordRoots")
              .of(word)
              .add(wordRoot)

          } else {
            if (wordWithRoot.definition !== meaning) {
              wordWithRoot.definition = meaning;
              await wordWithRoot.save();
            }
          }
        }
      }
    }

    return membeanWords;
  }

  async getWordsByLetter(letter: string, pageNumber: number = 1, user: User): Promise<Object> {
    letter = letter.toUpperCase()

    const maxPerPage = 10;

    const [words, count] = await Word.createQueryBuilder( 'word')
      .leftJoinAndSelect('word.wordRoots', 'wordRoot')
      .leftJoinAndSelect('word.userWords', 'userWord')
      .leftJoinAndSelect('userWord.user', 'user')
      .where(`UPPER(LEFT(word.name,1))='${letter}'`)
      .orderBy('word.name', 'ASC')
      .skip(maxPerPage * (pageNumber - 1))
      .take(maxPerPage)
      .getManyAndCount()

    const wordsByLetter = words.map(item => {

      const userWords = item.userWords
      let addWord: boolean = true

      for (const userWord of userWords) {
        if (userWord.user.id === user.id) {
          addWord = false;
          break;
        }
      }

      delete item.userWords
      item['addWord'] = addWord

      return item
    })

    const pagesCount = Math.ceil(count / maxPerPage)

    const pages: object[] = getPaginationPages(pagesCount, pageNumber)

    const pagination: object = getPagination(pagesCount, pageNumber)

    return {
      words: wordsByLetter,
      pages: pages,
      pagination: pagination,
      root: true,
      letter,
    };
  }

  async addWordToUser(wordId: string, user: User, letter: string, pageNumber: number): Promise<Object> {

    const word = await Word.findOne(wordId)
    const inputDate: Date = new Date();

    const userWord = new UserWord();
    userWord.wordStatus = Status.ACTIVE
    userWord.lastUpdatedDate = inputDate;
    userWord.repetitionDate = inputDate;
    userWord.repetitionTime = RepetitionTime.IMMEDIATELLY;
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

    return await this.getWordsByLetter(letter, pageNumber, user)
  }

  async deleteUserWord(wordId: string, user: User, letter: string, pageNumber: number): Promise<Object> {

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
      .where("wordId = :wordId", {wordId: `${wordId}`})
      .andWhere("userId = :userId", {userId: `${user.id}`})
      .execute();

    const log = new Log();
    log.actionDate = new Date();
    log.actionType = ActionType.DELETION;
    log.repetitionTime = RepetitionTime[wordRepetitionTime]
    log.user = user;
    log.word = word;
    await log.save();

    return await this.getWordsByLetter(letter, pageNumber, user)
  }
}
