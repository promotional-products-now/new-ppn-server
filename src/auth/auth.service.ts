import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { loginResponse } from './interface/auth.interface';
import { UserRole } from '../user/enums/role.enum';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from '../configs';
import { JwtSigningPayload } from '../commons/dtos/jwt.dto';
import * as speakeasy from 'speakeasy';
import { ChangePasswordDto, EmailDTO, ValidateUserDto } from './dto/auth.dto';
import { UserDocument } from '../user/schemas/user.schema';
import { UserActivityService } from '../user_activity/user_activity.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userActivityService: UserActivityService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<loginResponse, 'accessToken'> | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      return null;
    }

    const { password, ...result } = user.toObject(); // Convert to plain object
    return result;
  }

  public async login(user: any): Promise<loginResponse> {
    const accessToken = await this.generateToken({
      email: user.email,
      uid: user._id,
      r: user.role,
      action: 'verify_otp',
    });
    await this.userService.updateOne(user._id, { otpSecret: user.otpSecret });

    return { ...user, accessToken, otpSecret: user.otpSecret };
  }

  public async create(user: any) {
    const existUser = await this.userService.findOneByEmail(user.email.address);

    if (existUser) {
      throw new ConflictException('Email already Exist');
    }

    const pass = await this.hashPassword(user.password);

    const newUser = await this.userService.create({ ...user, password: pass });
    // console.log({ user, existUser, newUser });
    const { password, ...result } = newUser.toObject(); // Convert to plain object

    const accessToken = await this.generateToken({
      email: user.email,
      uid: result._id.toHexString(),
      r: UserRole.USER,
      action: 'verify_otp',
    });

    await this.userActivityService.create(newUser._id.toString(), {
      activity: 'signup',
    });

    return { ...result, accessToken };
  }

  async generateToken(payload: JwtSigningPayload): Promise<string> {
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

  generateOtp(): string {
    return speakeasy.generateSecret().base32;
  }

  decodeOTP(otpSecret: string): string {
    const otp = speakeasy.totp({
      secret: otpSecret,
      encoding: 'base32',
      step: 300, // 5mins
    });
    return otp;
  }

  async updateOtp(params: EmailDTO): Promise<string> {
    const user = await this.userService.findOneByEmail(params.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const otpSecret = this.generateOtp();

    await this.userService.updateOne(user._id, {
      otpSecret,
    });

    return this.decodeOTP(otpSecret);
  }

  async changePassword(params: ChangePasswordDto): Promise<UserDocument> {
    const { email, password } = params;
    const pass = await this.hashPassword(password);

    const user = await this.userService.findOneAndUpdate(email, {
      password: pass,
    });

    await this.userActivityService.create(user._id.toString(), {
      activity: 'change password',
    });
    return user;
  }

  async validateUserOtp(
    params: ValidateUserDto,
  ): Promise<{ user: any; accessToken: string } | null> {
    const { email, otp } = params;
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verifyOtp = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: otp,
      step: 300, // OTP valid for 5 minutes
      window: 1,
    });

    if (verifyOtp) {
      const accessToken = await this.generateToken({
        email: { address: user.email.address, isVerified: true },
        uid: user._id.toHexString(),
        r: UserRole.USER,
        action: 'authorize',
      });

      await this.userService.updateOne(user._id, {
        email: { address: email, isVerified: true },
      });

      await this.userActivityService.create(user._id.toString(), {
        activity: 'login',
      });

      return { user, accessToken };
    }

    throw new BadRequestException('invalid otp');
  }

  verifyToken(token: string): JwtSigningPayload {
    return this.jwtService.verify<JwtSigningPayload>(token);
  }

  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async comparePassword(
    enteredPassword: string,
    dbPassword: string,
  ): Promise<boolean> {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }
}
