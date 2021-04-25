import { Controller, Get, Param, Render, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthExceptionFilter } from 'src/filters/auth-exceptions.filter';
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

  @Get('/:wordRoot')
  @Render('words')
  async getWordsByRoot(
    @Param('wordRoot') wordRoot: string,
  ) {
    return await this.rootsService.getWordsByRoot(wordRoot);
  }

}
