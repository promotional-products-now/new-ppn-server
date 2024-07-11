import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  Res,
  Get,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  SignupAuthDto,
  LoginAuthDto,
  ValidateUserDto,
  EmailDTO,
  ChangePasswordDto,
  creatAdminDto,
} from './dto/auth.dto';
import { loginResponse } from './interface/auth.interface';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { EmailService } from '../commons/services/Notification/Email/email.service';
import { ConfigService } from '@nestjs/config';
import { sendGrid } from '../configs';
import { Throttle } from '@nestjs/throttler';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import {
  Environments,
  environments,
} from '../commons/types/environments.types';
// import { AlgoliaService } from '../commons/services/Algolia/algolia.service';
// import { omit } from 'lodash';

@ApiTags('auth')
@Throttle({ default: { limit: 6, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
    // private algoliaService: AlgoliaService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: LoginAuthDto,
    @Request() req,
    @Res({ passthrough: true }) response,
  ): Promise<{ message: string; payload: loginResponse }> {
    const { template } = this.configService.getOrThrow<sendGrid>('sendGrid');
    const appEnv = this.configService.getOrThrow<Environments>('appEnv');
    const otpSecret = this.authService.generateOtp();
    const result = await this.authService.login({ ...req.user, otpSecret });
    const accessToken = result.accessToken;

    const otp = this.authService.decodeOTP(result.otpSecret);

    // send otp
    await this.emailService.sendEmailWithTemplate({
      recipientEmail: loginDto.email,
      templateId: template.otp,
      dynamicTemplateData: { otp: otp },
    });

    response.cookie('token', accessToken, {
      maxAge: 48 * 60 * 60 * 1000, // 2 days
      httpOnly: true,
      signed: true,
    });

    return {
      message: 'Login successful',
      payload: result,
      ...{ ...(appEnv === environments.dev && { otp: otp }) },
    };
  }

  @Post('signup')
  async signUp(@Body() body: SignupAuthDto) {
    const appEnv = this.configService.getOrThrow<Environments>('appEnv');

    const otpSecret = this.authService.generateOtp();
    const email = { address: body.email, isVerified: false };
    const user = await this.authService.create({
      ...body,
      email,
      otpSecret,
    });

    const { template } = this.configService.getOrThrow<sendGrid>('sendGrid');

    const otp = this.authService.decodeOTP(user.otpSecret);

    //send welcome email
    await this.emailService.sendEmailWithTemplate({
      recipientEmail: email.address,
      templateId: template.welcome,
      dynamicTemplateData: {
        name: `${user.lastName} ${user.firstName}`,
      },
    });

    // send otp
    await this.emailService.sendEmailWithTemplate({
      recipientEmail: email.address,
      templateId: template.otp,
      dynamicTemplateData: {
        otp: otp,
        name: `${user.lastName} ${user.firstName}`,
      },
    });

    return {
      message: 'User created',
      payload: email,
      ...{ ...(appEnv === environments.dev && { otp: otp }) },
    };
  }

  async createAdmin(@Body() body: creatAdminDto) {
    const otpSecret = this.authService.generateOtp();
    const adminId = this.generateAdminId(body.role, body.lastName);

    const email = { address: body.email, isVerified: false };
    const user = await this.authService.create({
      ...body,
      email,
      otpSecret,
      adminId,
    });

    // const { template } = this.configService.getOrThrow<sendGrid>('sendGrid');

    const otp = this.authService.decodeOTP(user.otpSecret);

    // send magic link
    // await this.emailService.sendEmailWithTemplate({
    //   recipientEmail: email.address,
    //   templateId: template.otp,
    //   dynamicTemplateData: { otp: otp },
    // });

    return {
      message: 'User created',
      payload: email,
    };
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
    const user = await this.authService.changePassword(body);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const { template } = this.configService.getOrThrow<sendGrid>('sendGrid');

    await this.emailService.sendEmailWithTemplate({
      recipientEmail: user.email.address,
      templateId: template.passwordChange,
      dynamicTemplateData: { userName: `${user.lastName} ${user.firstName}` },
    });
    return user;
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: EmailDTO) {
    const { template } = this.configService.getOrThrow<sendGrid>('sendGrid');

    const otp = await this.authService.updateOtp(body);
    await this.emailService.sendEmailWithTemplate({
      recipientEmail: body.email,
      templateId: template.otp,
      dynamicTemplateData: { otp: otp },
    });
    return { message: 'otp sent' };
  }

  @Post('validate-user')
  async validateUser(@Body() body: ValidateUserDto) {
    const result = await this.authService.validateUserOtp(body);
    if (!result) {
      return { message: 'invalid otp' };
    }
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Get('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response) {
    response.clearCookie('token');
    return { message: 'Logout successful' };
  }

  generateAdminId(adminType: string, lastName: string): string {
    const randomStringLength = 4;

    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < randomStringLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }

    let adminTypeInitial = '';
    switch (adminType) {
      case 'super-admin':
        adminTypeInitial = 'S';
        break;
      case 'editor-admin':
        adminTypeInitial = 'E';
        break;
      case 'customer-care-admin':
        adminTypeInitial = 'C';
        break;
      default:
        adminTypeInitial = 'U'; // Unknown or unspecified admin type
    }

    const adminId = `${adminTypeInitial}${lastName.charAt(0).toUpperCase()}${randomString}`;

    return adminId.slice(0, 10);
  }
}
