import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SignupAuthDto, LoginAuthDto } from './dto/auth.dto';
import { loginResponse } from './interface/auth.interface';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import { UserRole } from '../user/enums/role.enum';
import { Nationality } from '../user/enums/nationality.enum';
import { RelationshipType } from '../user/enums/relationshipType.enum';
import { EmailService } from '../commons/services/Notification/Email/email.service';
import { ConfigService } from '@nestjs/config';
import { getUser } from '../../test/test.helper';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { JWTService } from '../commons/services/JWTService/JWTService.service';

const mockAuthService = {
  login: jest.fn(),
  create: jest.fn().mockResolvedValue(getUser({})),
  generateOtp: jest.fn(),
  decodeOTP: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};
const mockEmailService = {
  sendEmailWithTemplate: jest.fn(),
};

const mockConfigService = () => ({
  getOrThrow: jest.fn().mockReturnValue({
    template: 'privateKey',
    appEnv: 'production',
    otp: 'opeke',
    sendGrid: { otp: 'opeke' },
  }),
});

const user = {
  email: { address: faker.internet.email(), isVerified: false },
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  lastActive: faker.date.recent(),
  otp: '',
  location: undefined,
  role: UserRole.USER,
};
const mockAuthGuard = (strategy: string) => ({
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'userId' }; // mock user object
    return true;
  },
});

const mockAuthorizationGuard = () => ({
  canActivate: jest.fn(() => true),
});

const mockJWTService = () => ({
  validateToken: jest.fn(),
  generateToken: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let configService: ConfigService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: AuthorizationGuard, useValue: mockAuthorizationGuard() },
        { provide: JWTService, useValue: mockJWTService() },
        { provide: ConfigService, useValue: mockConfigService() },
      ],
    })
      .overrideGuard(AuthGuard('local'))
      .useValue(mockAuthGuard('local'))
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard('jwt'))
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should log in a user and set a cookie', async () => {
      const loginDto: LoginAuthDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const req = { user: { id: 'userId' } };
      const res = { cookie: jest.fn() };

      const loginResponse: loginResponse = {
        accessToken: 'token',
        ...getUser({}),
      };

      (service.login as jest.Mock).mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto, req, res);
      expect(result).toEqual({
        message: 'Login successful',
        payload: loginResponse,
      });
      expect(res.cookie).toHaveBeenCalledWith('token', 'token', {
        maxAge: 48 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true,
      });
    });

    // it('should throw an UnauthorizedException if login fails', async () => {
    //   const loginDto: LoginAuthDto = {
    //     email: 'test@test.com',
    //     password: 'password',
    //   };
    //   const req = { user: null };
    //   const res = { cookie: jest.fn() };

    //   (service.login as jest.Mock).mockResolvedValue(null);

    //   await expect(controller.login(loginDto, req, res)).rejects.toThrow(
    //     UnauthorizedException,
    //   );
    // });
  });

  describe('signUp', () => {
    it('should create a user', async () => {
      const user = getUser({});
      const signUpDto: SignupAuthDto = {
        email: user.email.address,
        password: 'password',
        firstName: user.firstName,
        confirmPassword: 'password',
        lastName: '',
        phone: '',
        location: undefined,
      };

      const result = await controller.signUp(signUpDto);

      expect(result).toEqual({
        message: 'User created',
        payload: user.email,
      });
      expect(service.create).toHaveBeenCalledWith({
        ...signUpDto,
        email: { address: signUpDto.email, isVerified: false },
      });
    });
  });

  describe('logout', () => {
    it('should log out a user and clear the cookie', async () => {
      const req = { user: { id: 'userId' } };
      const res = { clearCookie: jest.fn() };

      const result = await controller.logout(req, res);
      expect(result).toEqual({ message: 'Logout successful' });
      expect(res.clearCookie).toHaveBeenCalledWith('token');
    });
  });
});
