import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserObj } from 'src/decorators/user-obj.decorator';
import { AuthExceptionFilter } from 'src/filters/auth-exceptions.filter';
import { User } from 'src/users/entities/user.entity';
import { RootsService } from './roots.service';
@Controller('roots')
@UseFilters(AuthExceptionFilter)
@UseGuards(AuthGuard('jwt'))
export class RootsController {
  constructor(private readonly rootsService: RootsService) {}

  @Get('/')
  @Render('rootWords')
  async getRootWords() {
    return { rootWords: await this.rootsService.getRootWords() };
  }

  @Post('/:wordRoot/:rootId')
  @Render('words')
  async wordsByRoot(
    @UserObj() user: User,
    @Body() body: BodyInit,
    @Param('wordRoot') wordRoot: string,
    @Param('rootId') rootId: string,
  ) {
    if (body.hasOwnProperty('add')) {
      return await this.rootsService.addWordToUser(
        wordRoot,
        body['add'],
        user,
        rootId,
      );
    } else if (body.hasOwnProperty('del')) {
      return await this.rootsService.deleteUserWord(
        wordRoot,
        body['del'],
        user,
        rootId,
      );
    } else if (body.hasOwnProperty('id')) {
      return await this.rootsService.getWordsByRoot(wordRoot, user, rootId);
    }
  }
}
