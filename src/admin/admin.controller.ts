import { Controller, Get, Post, Render, Redirect, UseGuards, UseFilters } from '@nestjs/common';
import { WordsService } from 'src/words/words.service';
import { AdminService } from './admin.service';
import { AuthGuard } from "@nestjs/passport";
import { AuthExceptionFilter } from 'src/filters/auth-exceptions.filter';
import { RolesGuard } from 'src/guards/roles.guard';
@Controller('admin')
@UseFilters(AuthExceptionFilter)
@UseGuards(AuthGuard('jwt'), RolesGuard)

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
    return await this.adminService.updateWordDefinitions()
  }

  @Get('/definition/add')
  @Redirect('/admin')
  async addMissingWordDefinitions() {
    return await this.adminService.addMissingWordDefinitions()
  }

}

