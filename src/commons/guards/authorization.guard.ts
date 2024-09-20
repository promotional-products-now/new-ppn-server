import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAction, JwtSigningPayload } from '../dtos/jwt.dto';
import { JWTService } from '../services/JWTService/JWTService.service';
import { UserService } from '../../user/user.service';
import { Types } from 'mongoose';
import { UserRole } from 'src/user/enums/role.enum';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JWTService,
    private readonly userService: UserService,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type === 'Bearer') {
      return token;
    }

    return undefined;
  }

  private extractUserIdFromHeader(request: Request): string | undefined {
    return request.get('x-uid');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);

    if (!accessToken) {
      throw new ForbiddenException('The required headers are missing');
    }

    let payload: JwtSigningPayload;
    try {
      payload = this.jwtService.verifyToken(accessToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization credentials');
    }

    if (payload.action !== JwtAction.authorize) {
      throw new UnauthorizedException('Invalid authorization credentials');
    }

    const userId = this.extractUserIdFromHeader(request);

    if (userId !== payload.uid) {
      throw new UnauthorizedException('Invalid authorization credentials');
    }

    const user = await this.userService.findOneById(new Types.ObjectId(userId));
    if (!user) {
      throw new UnauthorizedException('Invalid authorization credentials');
    }

    if (user.role === UserRole.USER && user.accessToken !== accessToken) {
      throw new UnauthorizedException('Invalid authorization credentials');
    }

    request['user'] = {
      email: payload.email,
      userId: payload.uid,
      role: payload.r,
      userType: user.userType,
      deviceHash: payload.did,
    };

    return true;
  }
}
