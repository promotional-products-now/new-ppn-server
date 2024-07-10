import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtSigningPayload } from '../../dtos/jwt.dto';
import { AccessToken } from '../../../configs';

@Injectable()
export class JWTService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  verifyToken(token: string) {
    return this.jwtService.verify<JwtSigningPayload>(token);
  }

  async generateToken(payload: JwtSigningPayload) {
    const { email, uid, did, r, action } = payload;

    const { access_token_private_key, access_token_ttl } =
      this.configService.getOrThrow<AccessToken>('accessToken');

    const token = await this.jwtService.signAsync(
      { email, uid: uid, did, r, action },
      {
        secret: access_token_private_key,
        expiresIn: access_token_ttl,
      },
    );

    return token;
  }
}
