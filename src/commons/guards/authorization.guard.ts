import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAction, JwtSigningPayload } from '../dtos/jwt.dto';
import { JWTService } from '../services/JWTService/JWTService.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly jwtService: JWTService) {}

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
      throw new BadRequestException('Invalid authorization credentials');
    }

    console.log({ payload1: payload });

    if (payload.action !== JwtAction.authorize) {
      throw new BadRequestException('Invalid authorization credentials');
    }
    console.log({ payload2: payload });

    const userId = this.extractUserIdFromHeader(request);

    if (userId !== payload.uid) {
      throw new BadRequestException('Invalid authorization credentials');
    }
    request['user'] = {
      email: payload.email,
      userId: payload.uid,
      role: payload.r,
      deviceHash: payload.did,
    };

    return true;
  }
}
