import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from '../configs';
import { LocalStrategy } from '../commons/strategy/local.strategy';
import { NotificationModule } from '../commons/services/Notification/notification.module';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { MagicLoginStrategy } from '../commons/strategy/magiclogin.strategy';

// import { AlgoliaService } from 'src/commons/services/Algolia/algolia.service';

@Module({
  imports: [
    PassportModule,
    UserModule,
    NotificationModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const { access_token_ttl, access_token_private_key } =
          configService.get<AccessToken>('accessToken');
        return {
          secret: access_token_private_key,
          signOptions: { expiresIn: access_token_ttl },
        };
      },
      inject: [ConfigService],
    }),
    JWTModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, MagicLoginStrategy],
  exports: [AuthService],
})
export class AuthModule {}
