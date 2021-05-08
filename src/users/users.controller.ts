import { Controller, Get, Post, Body, Render, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterUserResponse } from 'src/interfaces/user';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  register(
    @Body() newUser: RegisterDto,
    @Res() res: Response,
  ): Promise<RegisterUserResponse> {
    return this.usersService.register(newUser, res);
  }

  @Get('/register')
  @Render('register')
  registerPage(){}

  @Get('/login')
  @Render('login')
  loginPage(){}

}
