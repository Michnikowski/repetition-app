import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async register(@Body() newUser: RegisterDto, @Res() res: Response) {
    const user = await this.usersService.register(newUser);
    if (user) {
      return res.redirect('/users/login');
    } else {
      res.status(HttpStatus.BAD_REQUEST);
      return res.render('register', { registerError: true });
    }
  }

  @Get('/register')
  @Render('register')
  registerPage() {
    return;
  }

  @Get('/login')
  @Render('login')
  loginPage() {
    return;
  }
}
