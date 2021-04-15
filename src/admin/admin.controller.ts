import { Controller, Get, Post, Render, Redirect } from '@nestjs/common';
import { WordsService } from 'src/words/words.service';
import { AdminService } from './admin.service';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService,
    private readonly wordsService: WordsService) {}

  @Get('/')
  @Render('admin')
  renderAdmin(){}

  @Post('/')
  getMembeanWords(){
    return this.wordsService.getWords();
  }

  @Get('/defintion/update')
  @Redirect('/admin')
  async updateWordDefinitions() {
    return console.log('updateWORD')
  }

  @Get('/definition/add')
  @Redirect('/admin')
  async addWordDefinition() {
    return console.log('addWORD')
  }
}
