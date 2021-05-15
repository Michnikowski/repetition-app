import { Body, Controller, Get, Post, Redirect, Render, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserObj } from 'src/decorators/user-obj.decorator';
import { AuthExceptionFilter } from 'src/filters/auth-exceptions.filter';
import { User } from 'src/users/entities/user.entity';
import { UpdateUserWordDto } from './dto/update_user_word.dto';
import { RepetitionsService } from './repetitions.service';

@Controller('repetitions')
@UseFilters(AuthExceptionFilter)
@UseGuards(AuthGuard('jwt'))
export class RepetitionsController {
  constructor(private readonly repetitionsService: RepetitionsService) {}
  @Get('/')
  @Render('repetitions')
  async getTodayUserWord(
    @UserObj() user: User,
  ) {
    return await this.repetitionsService.getTodayUserWord(user);
  }

  @Post('/')
  @Redirect('/repetitions')
  async updateUserWord(
    @UserObj() user: User,
    @Body() body: UpdateUserWordDto,
  ) {
    return await this.repetitionsService.updateUserWord(user, body);
  }

}
