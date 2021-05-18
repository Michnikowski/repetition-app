import {
  Controller,
  Get,
  Param,
  Render,
  Body,
  UseGuards,
  Post,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserObj } from 'src/decorators/user-obj.decorator';
import { User } from 'src/users/entities/user.entity';
import { SingleWordDto } from './dto/single-word.dto';
import { MywordsService } from './mywords.service';

@Controller('mywords')
@UseGuards(AuthGuard('jwt'))
export class MywordsController {
  constructor(private readonly mywordsService: MywordsService) {}

  @Post('/word/:word')
  @Render('singleWord')
  async findSingleWord(@Body() singleWord: SingleWordDto) {
    return await this.mywordsService.findSingleWord(singleWord);
  }

  @Get('/randomWords')
  @Render('mywords')
  async appendRandomWords(@UserObj() user: User) {
    return await this.mywordsService.appendRandomWords(user);
  }

  @Get('/word/delete/:id')
  @Redirect('/mywords/1')
  async deleteUserWord(@UserObj() user: User, @Param('id') wordId: string) {
    return await this.mywordsService.deleteUserWord(user, wordId);
  }

  @Get('/:pageNumber')
  @Render('mywords')
  async findAllUserWords(
    @UserObj() user: User,
    @Param('pageNumber') pageNumber: number,
  ) {
    pageNumber = Number(pageNumber);
    return await this.mywordsService.findAllUserWords(user, pageNumber);
  }
}
