import { Injectable } from '@nestjs/common';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import * as puppeteer from 'puppeteer';
import { GetWordsResponse } from './dto/membean.dto';
import { WordRoot } from './entities/word-root.entity';
import { Word } from './entities/word.entity';
import { createQueryBuilder, getConnection, getRepository } from 'typeorm';

@Injectable()
export class WordsService {

  async getWords(): Promise<object[]> {

    const browser: puppeteer.Browser = await puppeteer.launch({
      headless: false,
      slowMo: 150,
      devtools: true,
    });

    const page: puppeteer.Page = await browser.newPage();
    await page.goto('https://membean.com/treelist');
    await page.waitForSelector('#treelist');

    const rootForms = await page.$$(`span.rootform > a`);

    const membeanWords: GetWordsResponse = [];

    for ( const rootForm of rootForms ) {

      try {
        await rootForm.click({ delay: 200 });
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
          word.inlist = inlist;
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

  async getWordsByLetter(letter: string, pageNumber: number = 1): Promise<Object> {

    letter = letter.toUpperCase()

    const maxPerPage = 10;

    const [wordsByLetter, count] = await createQueryBuilder('Word', 'word')
      .leftJoinAndSelect('word.wordRoots', 'wordRoot')
      .where(`UPPER(LEFT(word.name,1))='${letter}'`)
      .orderBy('word.name', 'ASC')
      .skip(maxPerPage * (pageNumber - 1))
      .take(maxPerPage)
      .getManyAndCount()

    const pagesCount = Math.ceil(count / maxPerPage)

    const pages = [];

    if (pagesCount <= 3) {
      for (let i = 1; i <= pagesCount; i++){
          pages.push(
            {
              pageNumber: i,
              activePage: i === pageNumber
            }
          )
        }
      } else {

        let i: number;
        let stop: number;

        if (pageNumber === 1) {
          i = 1;
          stop = 3;
        } else if (pageNumber === pagesCount) {
          i = pageNumber - 2;
          stop = pagesCount;
        } else {
          i = pageNumber - 1;
          stop = pageNumber + 1;
        }

        for (i; i <= stop; i++ ) {
          pages.push(
            {
              pageNumber: i,
              activePage: i === pageNumber
            }
          )
        }
      }

    const pagination = {
      prev: pageNumber > 1 ? pageNumber - 1 : 1,
      next: pageNumber < pagesCount ? pageNumber + 1 : pagesCount,
      first: 1,
      last: pagesCount,
    }

    return {
      words: wordsByLetter,
      pages: pages,
      pagination: pagination,
    };
  }

  // create(createWordDto: CreateWordDto) {
  //   return 'This action adds a new word';
  // }

  // findAll() {
  //   return `This action returns all words`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} word`;
  // }

  // update(id: number, updateWordDto: UpdateWordDto) {
  //   return `This action updates a #${id} word`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} word`;
  // }
}
