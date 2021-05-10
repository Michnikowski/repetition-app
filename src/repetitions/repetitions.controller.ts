import { Controller, Get, Render, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserObj } from 'src/decorators/user-obj.decorator';
import { AuthExceptionFilter } from 'src/filters/auth-exceptions.filter';
import { User } from 'src/users/entities/user.entity';
import { RepetitionsService } from './repetitions.service';

@Controller('repetitions')
@UseFilters(AuthExceptionFilter)
@UseGuards(AuthGuard('jwt'))
export class RepetitionsController {
  constructor(private readonly repetitionsService: RepetitionsService) {}
  @Get('/')
  @Render('repetitions')
  async getRootWords(
    @UserObj() user: User,
  ) {
    return await this.repetitionsService.getTodayUserWord(user);
  }

}
