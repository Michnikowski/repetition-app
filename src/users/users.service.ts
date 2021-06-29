import { Injectable } from '@nestjs/common';
import { RegisterUserResponse } from 'src/interfaces/user';
import { hashPwd } from 'src/utils/hash-pwd';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from './entities/user.entity';
import { ActionType, Log } from './entities/log.entity';
@Injectable()
export class UsersService {
  filter(user: User): RegisterUserResponse {
    const { id, email } = user;
    return { id, email };
  }

  async register(newUser: RegisterDto): Promise<User> {
    try {
      const user = new User();
      user.email = newUser.email;
      user.firstName = newUser.firstName;
      user.lastName = newUser.lastName;
      user.isActive = true;
      user.role = UserRole.USER;
      user.pwdHash = hashPwd(newUser.pwd);
      await user.save();

      const log = new Log();
      log.actionDate = new Date();
      log.actionType = ActionType.REGISTRATION;
      log.user = user;
      await log.save();

      return user;
    } catch (e) {
      return;
    }
  }
}
