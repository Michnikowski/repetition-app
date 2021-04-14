import { Controller, Get, Param, Render } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('/membean')
  getMembeanWords(){
    return this.wordsService.getWords();
  }

  @Get('/:letter/:pageNumber')
  @Render('wordsByLetter')
  async getWordsByLetter(
    @Param('letter') letter: string,
    @Param('pageNumber') pageNumber: number,
  ) {
    return await this.wordsService.getWordsByLetter(letter, Number(pageNumber));
  }

}
