import { Controller, Get, Param, Render, UseFilters, UseGuards } from '@nestjs/common';
import { WordsService } from './words.service';
import { AuthGuard } from "@nestjs/passport";
import { AuthExceptionFilter } from 'src/filters/auth-exceptions.filter';
@Controller('words')
@UseFilters(AuthExceptionFilter)
@UseGuards(AuthGuard('jwt'))
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('/:letter/:pageNumber')
  @Render('words')
  async getWordsByLetter(
    @Param('letter') letter: string,
    @Param('pageNumber') pageNumber: number,
  ) {
    return await this.wordsService.getWordsByLetter(letter, Number(pageNumber));
  }

}
