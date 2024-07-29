import {
  Controller,
  UseGuards,
  Post,
  Body,
  Res,
  Get,
  HttpCode,
  NotFoundException,
  ForbiddenException,
  Patch,
  Req,
  ConflictException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  SignupAuthDto,
  LoginAuthDto,
  ValidateUserDto,
  EmailDTO,
  ChangePasswordDto,
  creatAdminDto,
  AdminloginResponse,
} from './dto/auth.dto';
import { IResetPassword, loginResponse } from './interface/auth.interface';
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
import { UserRole } from '../user/enums/role.enum';
import { UserService } from '../user/user.service';
import { MagicLoginStrategy } from '../commons/strategy/magiclogin.strategy';
import { JwtAction } from '../commons/dtos/jwt.dto';
import { BannedUserGuard } from '../commons/guards/banned_user.guard';
// import { AlgoliaService } from '../commons/services/Algolia/algolia.service';
// import { omit } from 'lodash';

@ApiTags('auth')
@Throttle({ default: { limit: 6, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private emailService: EmailService,
    // private algoliaService: AlgoliaService,
    private readonly configService: ConfigService,
    private strategy: MagicLoginStrategy,
  ) {}

  @UseGuards(AuthGuard('local'))
  @UseGuards(BannedUserGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: LoginAuthDto,
    @Req() req,
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

  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('app-login')
  async adminLogin(
    @Body() loginDto: LoginAuthDto,
    @Req() req,
    @Res({ passthrough: true }) response,
  ): Promise<{ message: string; payload: loginResponse }> {
    const { template } = this.configService.getOrThrow<sendGrid>('sendGrid');
    const appEnv = this.configService.getOrThrow<Environments>('appEnv');
    const otpSecret = this.authService.generateOtp();
    const result = await this.authService.login({ ...req.user, otpSecret });
    const accessToken = result.accessToken;

    const otp = this.authService.decodeOTP(result.otpSecret);

    // Send OTP
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

  @Post('create-admin')
  async createAdmin(@Body() payload: creatAdminDto, @Req() req: Request) {
    // find user
    const admin = await this.userService.findOneByEmail(payload.email);
    const adminId = this.generateAdminId(payload.role, payload.lastName);

    this.logger.debug('admin : ', { admin, payload });

    if (admin)
      throw new ConflictException('This admin with email already exist');

    const email = { address: payload.email, isVerified: false };

    const user = await this.userService.create({
      ...payload,
      email,
      adminId,
    });

    req.body.destination = {
      recipientEmail: payload.email,
      recipientName: `${payload.lastName} ${payload.firstName}`,
      role: user.role,
      userId: user._id,
    };

    // this.strategy.send(req, res);
    const { template } = this.configService.getOrThrow<sendGrid>('sendGrid');
    const accessToken = await this.authService.generateToken({
      email: { address: user.email.address, isVerified: true },
      uid: user._id.toHexString(),
      r: UserRole.USER,
      action: JwtAction.authorize,
    });
    const href = `https://app.${this.configService.get<string>('domain')}/change-password/?token=${accessToken}`;
    console.log({ accessToken, href });

    await this.emailService.sendEmailWithTemplate({
      recipientEmail: user.email.address,
      templateId: template.newAdmin,
      dynamicTemplateData: {
        name: `${user.lastName} ${user.firstName}`,
        link: `${href}&uid=${user._id}`,
      },
    });

    return {
      message: 'user account created successfully',
      user: user,
    };
  }

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto, @Req() req) {
    const { email } = req.user;
    const user = await this.authService.changePassword({
      ...body,
      email: email.address as string,
    });
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
  async logout(@Req() req, @Res({ passthrough: true }) response) {
    const { userId } = req.user;
    response.clearCookie('token');

    await this.authService.logout(userId);

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
