import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserStatus } from '../../user/enums/status.enum';
import { UserService } from '../../user/user.service';

@Injectable()
export class BannedUserGuard implements CanActivate {
  constructor(private readonly usersService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const email = request.body.email;
    if (!email) {
      throw new ForbiddenException('User ID is not available');
    }

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`${email} does not exist`);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        'You are banned from performing this action',
      );
    }

    return true;
  }
}
