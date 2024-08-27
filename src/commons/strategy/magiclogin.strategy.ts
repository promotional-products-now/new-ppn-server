import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';
import { UserService } from '../../user/user.service';
import { User } from '../../user/schemas/user.schema';
import { AccessToken, AppConfig, sendGrid } from '../../configs';
import { EmailService } from '../services/Notification/Email/email.service';

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(MagicLoginStrategy.name);
  constructor(
    private emailService: EmailService,
    public readonly userService: UserService,
    public readonly configService: ConfigService,
  ) {
    super({
      secret:
        configService.get<AccessToken>('accessToken').access_token_private_key,
      jwtOptions: {
        expiresIn:
          configService.get<AccessToken>('accessToken').access_token_ttl,
      },
      callbackUrl: `https://app.${configService.get<string>('domain')}/change-password/`,
      sendMagicLink: async (destination, href) => {
        //send email
        const { template } =
          this.configService.getOrThrow<sendGrid>('sendGrid');

        await this.emailService.sendEmailWithTemplate({
          recipientEmail: destination.recipientEmail,
          templateId: template.newAdmin,
          dynamicTemplateData: {
            name: `${destination.recipientName}`,
            link: `${href}&uid=${destination.userId}`,
          },
        });


        this.logger.debug(
          `send email to ${destination.recipientEmail} with link ${href}`,
        );
      },
      verify: async (payload, callback) => {
        callback(null, await this.validate(payload));
      },
    });
  }

  async validate(payload: any): Promise<User> {
    if (Date.now() >= payload.exp * 1000) {
      throw new BadRequestException();
    }

    const user = await this.userService.findOneByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
