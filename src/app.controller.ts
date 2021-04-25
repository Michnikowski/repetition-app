import { Get, Controller, Render, UseGuards, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { AuthExceptionFilter } from './filters/auth-exceptions.filter';
@Controller()
@UseGuards(AuthGuard('jwt'))
@UseFilters(AuthExceptionFilter)
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @Render('home')
  async getAlphabet() {
    return await this.appService.getAlphabet();
  }

}
