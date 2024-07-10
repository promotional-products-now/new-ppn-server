import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { UserRole } from '../user/enums/role.enum';
import { ObjectId } from 'mongodb';

const mockUserService = () => ({
  findOneByEmail: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  findUserByEmailOrUsername: jest.fn(),
});

const mockJwtService = () => ({
  signAsync: jest.fn(),
  verify: jest.fn(),
});

const mockConfigService = () => ({
  getOrThrow: jest.fn().mockReturnValue({
    access_token_private_key: 'privateKey',
    access_token_ttl: '1h',
  }),
});

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService() },
        { provide: JwtService, useValue: mockJwtService() },
        { provide: ConfigService, useValue: mockConfigService() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      const email = 'test@test.com';
      const pass = 'password';
      const user = {
        _id: 'userId',
        email,
        password: await bcrypt.hash(pass, 10),
        toObject: jest.fn().mockReturnValue({ _id: 'userId', email }),
      };

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser(email, pass);
      expect(result).toEqual({ _id: 'userId', email });
      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if user not found', async () => {
      const email = 'test@test.com';
      const pass = 'password';

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser(email, pass);
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const email = 'test@test.com';
      const pass = 'password';
      const user = {
        _id: 'userId',
        email,
        password: 'wrongPassword',
        toObject: jest.fn().mockReturnValue({ _id: 'userId', email }),
      };

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser(email, pass);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user and accessToken on successful login', async () => {
      const user = {
        _id: 'userId',
        email: 'test@test.com',
        role: UserRole.USER,
      };
      const accessToken = 'accessToken';

      (jwtService.signAsync as jest.Mock).mockResolvedValue(accessToken);

      const result = await service.login(user);

      expect(result).toEqual({ ...user, accessToken });
    });
  });

  describe('create', () => {
    it('should create a new user and return user with accessToken', async () => {
      const user = {
        email: { address: 'test@test.com', isVerified: false },
        password: 'password',
        username: 'testuser',
      };
      const newUser = {
        ...user,
        _id: new ObjectId(),
        toObject: jest.fn().mockReturnValue({
          ...user,
          _id: new ObjectId(),
        }),
      };
      const accessToken = 'accessToken';

      (userService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      (userService.create as jest.Mock).mockResolvedValue(newUser);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(accessToken);

      const result = await service.create(user);
      const { password, ...res } = newUser.toObject();
      expect(result).toEqual({ ...res, accessToken });
    });

    it('should throw ConflictException if email already exists', async () => {
      const user = {
        email: { address: 'test@test.com', isVerified: false },
        password: 'password',
        username: 'testuser',
      };
      const existingUser = { _id: 'existingUserId', email: user.email };

      (userService.findUserByEmailOrUsername as jest.Mock).mockResolvedValue(
        existingUser,
      );

      await expect(service.create(user)).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyToken', () => {
    it('should verify the given JWT token', async () => {
      const token = 'testToken';
      const payload = {
        email: 'test@test.com',
        uid: 'userId',
        r: UserRole.USER,
        action: 'verify_otp',
      };

      (jwtService.verify as jest.Mock).mockReturnValue(payload);

      const result = service.verifyToken(token);
      expect(result).toEqual(payload);
    });
  });

  describe('hashPassword', () => {
    it('should hash the given password', async () => {
      const password = 'password';

      const result = await service.hashPassword(password);

      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe('comparePassword', () => {
    it('should return true if passwords match', async () => {
      const password = 'password';
      const hash = await bcrypt.hash(password, 10);

      const result = await service.comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', async () => {
      const password = 'password';
      const hash = await bcrypt.hash('differentPassword', 10);

      const result = await service.comparePassword(password, hash);
      expect(result).toBe(false);
    });
  });
});
