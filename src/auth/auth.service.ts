import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { hashPwd } from 'src/utils/hash-pwd';
import { AuthLoginDto } from './dto/auth-login.dto';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import { JwtPayload } from './jwt.strategy';
import { ActionType, Log } from 'src/users/entities/log.entity';

@Injectable()
export class AuthService {
  private createToken(
    currentTokenId: string,
  ): { accessToken: string; expiresIn: number } {
    const payload: JwtPayload = { id: currentTokenId };
    const expiresIn = 60 * 60 * 24;
    const accessToken = sign(payload, process.env.SECRET, { expiresIn });
    return {
      accessToken,
      expiresIn,
    };
  }

  private async generateToken(user: User): Promise<string> {
    let token;
    let userWithThisToken = null;
    do {
      token = uuid();
      userWithThisToken = await User.findOne({ currentTokenId: token });
    } while (!!userWithThisToken);
    user.currentTokenId = token;
    await user.save();

    return token;
  }

  async login(req: AuthLoginDto, res: Response): Promise<any> {
    try {
      const user = await User.findOne({
        email: req.email,
        pwdHash: hashPwd(req.pwd),
      });

      if (!user) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .render('login', { userError: true });
      }

      const token = this.createToken(await this.generateToken(user));

      const log = new Log();
      log.actionDate = new Date();
      log.actionType = ActionType.LOGIN;
      log.user = user;
      await log.save();

      return res
        .cookie('jwt', token.accessToken, {
          secure: false,
          domain: 'localhost',
          httpOnly: true,
        })
        .redirect('/');
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .render('login', { userError: true });
    }
  }

  async logout(user: User, res: Response) {
    const log = new Log();
    log.actionDate = new Date();
    log.actionType = ActionType.LOGOUT;
    log.user = user;
    await log.save();

    try {
      user.currentTokenId = null;
      await user.save();
      res.clearCookie('jwt', {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
      });
    } catch (e) {
      return console.log(e);
    }
  }
}
