import { CanActivate, Injectable, ExecutionContext } from "@nestjs/common";
import { UserRole } from "src/users/entities/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.role === UserRole.ADMIN) {
      return true;
    }
  }
}
