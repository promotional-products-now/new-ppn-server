import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTService } from './JWTService.service';
import { LocalStrategy } from '../../strategy/local.strategy';
import { JwtStrategy } from '../../strategy/jwt.strategy';
import { AccessToken } from '../../../configs';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../user/schemas/user.schema';
import {
  UserDevice,
  UserDeviceSchema,
} from '../../../user/schemas/userDevice.schema';
import { AzureBlobService } from '../FileUploadService/azure-blob.service';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserDevice.name, schema: UserDeviceSchema },
    ]),
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
  ],
  controllers: [],
  providers: [
    LocalStrategy,
    JwtStrategy,
    JWTService,
    AuthService,
    UserService,
    AzureBlobService,
  ],
  exports: [JWTService],
})
export class JWTModule {}
