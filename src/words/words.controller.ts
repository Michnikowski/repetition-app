import { Body, Controller, Get, Param, Post, Render, UseFilters, UseGuards } from '@nestjs/common';
import { WordsService } from './words.service';
import { AuthGuard } from "@nestjs/passport";
import { AuthExceptionFilter } from 'src/filters/auth-exceptions.filter';
import { UserObj } from 'src/decorators/user-obj.decorator';
import { User } from 'src/users/entities/user.entity';
@Controller('words')
@UseFilters(AuthExceptionFilter)
@UseGuards(AuthGuard('jwt'))
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('/:letter/:pageNumber')
  @Render('words')
  async getWordsByLetter(
    @UserObj() user: User,
    @Param('letter') letter: string,
    @Param('pageNumber') pageNumber: number,
  ) {
    return await this.wordsService.getWordsByLetter(letter, Number(pageNumber), user);
  }

  @Post('/:letter/:pageNumber')
  @Render('words')
  async addWordToUser(
    @Body() body: BodyInit,
    @UserObj() user: User,
    @Param('letter') letter: string,
    @Param('pageNumber') pageNumber: number,
  ){
    pageNumber = Number(pageNumber)

    if (body.hasOwnProperty('add')) {
      return await this.wordsService.addWordToUser(body, user, letter, pageNumber)
    } else if (body.hasOwnProperty('del')) {
      return await this.wordsService.deleteUserWord(body, user, letter, pageNumber)
    }
  }

}
