import { Controller, Get, Param, Render } from '@nestjs/common';
import { RootsService } from './roots.service';

@Controller('roots')
export class RootsController {
  constructor(private readonly rootsService: RootsService) {}

  @Get('/')
  @Render('rootWords')
  async getRootWords() {
    return { rootWords: await this.rootsService.getRootWords() };
  }

  @Get('/:wordRoot')
  @Render('wordsByRoot')
  async getWordsByRoot(
    @Param('wordRoot') wordRoot: string,
  ) {
    return await this.rootsService.getWordsByRoot(wordRoot);
  }

}
