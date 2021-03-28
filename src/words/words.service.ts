import { Injectable } from '@nestjs/common';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import * as puppeteer from 'puppeteer';
import { GetMembeanWordsResponse } from './dto/membean.dto';
import { RootWord } from './entities/root-word.entity';
import { RootMemberWord } from './entities/root-member-word.entity';

@Injectable()
export class WordsService {

  async getMembeanWords(): Promise<object[]> {

    const browser: puppeteer.Browser = await puppeteer.launch({
      headless: false,
      slowMo: 200,
      devtools: true,
    });

    const page: puppeteer.Page = await browser.newPage();
    await page.goto('https://membean.com/treelist');
    await page.waitForSelector('#treelist');

    const rootForms = await page.$$(`span.rootform > a`);

    const membeanWords: GetMembeanWordsResponse = [];

    for ( const rootForm of rootForms ) {

      try {
        await rootForm.click({ delay: 300 });
        await page.waitForSelector('#treepanel');

        await page.once('response', async (response) => {

          const dataObject = await response.json()

          let rootForm: string = dataObject.data.drootform;
          let meaning: string = dataObject.data.meaning;
          let leafs: object[] = dataObject.data.leafs;

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

      const rootWord = new RootWord();
      const wordExistInDB = await RootWord.findOne({name: root} )

      if (!wordExistInDB) {
        rootWord.name = root;
        rootWord.meaning = meaning;

        try {
          await rootWord.save();
        } catch(e) {
          console.log(e.message);
        }
      }

      for (let leaf in leafs) {

        let { inlist, wordform, meaning } = leafs[leaf];
        const wordExistInDB = await RootMemberWord.findOne({name: wordform} )

        if (!wordExistInDB) {
          const rootMemberWord = new RootMemberWord();
          rootMemberWord.name = wordform;
          rootMemberWord.definition = meaning;
          rootMemberWord.inlist = inlist;
          rootMemberWord.rootWord = rootWord;

          try {
            await rootMemberWord.save();
          } catch(e) {
            console.log(e.message);
          }
        }
      }
    }

    return membeanWords;
  }

  create(createWordDto: CreateWordDto) {
    return 'This action adds a new word';
  }

  findAll() {
    return `This action returns all words`;
  }

  findOne(id: number) {
    return `This action returns a #${id} word`;
  }

  update(id: number, updateWordDto: UpdateWordDto) {
    return `This action updates a #${id} word`;
  }

  remove(id: number) {
    return `This action removes a #${id} word`;
  }
}
