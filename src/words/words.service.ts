import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { GetWordsResponse } from './dto/membean.dto';
import { WordRoot } from '../roots/entities/word-root.entity';
import { Word } from './entities/word.entity';
import { createQueryBuilder, getConnection, getRepository } from 'typeorm';
import { getPagination, getPaginationPages } from 'src/helpers/helper';

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

    const pages: object[] = getPaginationPages(pagesCount, pageNumber)

    const pagination: object = getPagination(pagesCount, pageNumber)

    return {
      words: wordsByLetter,
      pages: pages,
      pagination: pagination,
    };
  }

}
