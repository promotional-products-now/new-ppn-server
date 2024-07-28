import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Types } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { JWTService } from '../commons/services/JWTService/JWTService.service';
import * as httpMock from 'node-mocks-http';
import { getUser } from '../../test/test.helper';
import { AzureBlobService } from '../commons/services/FileUploadService/azure-blob.service';
import { json } from 'stream/consumers';
import {
  CountUserDtoStub,
  FindAdminStub,
  FindUserStub,
  UserDeviceStub,
  UserStub,
} from './user.stubs';
import { ObjectId } from 'mongodb';
import { fa, faker } from '@faker-js/faker';

const user = getUser({});

const mockUserService = () => ({
  find: jest.fn(),
  findOneById: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  create: jest.fn(),
  findOneByEmail: jest.fn(),
  findAllAdmin: jest.fn(),
  findUserByEmailOrUsername: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOneByEmail: jest.fn(),
  updateUserDevice: jest.fn(),
  setRefreshToken: jest.fn(),
  countUsers: jest.fn(),
  findWithCreatedAt: jest.fn(),
  banUserAccount: jest.fn(),
  banMultipleUserAccounts: jest.fn(),
});

const mockAuthorizationGuard = () => ({
  canActivate: jest.fn(() => true),
});

const mockJWTService = () => ({
  validateToken: jest.fn(),
  generateToken: jest.fn(),
});

const mockAzureStorage = {
  uploadImage: jest
    .fn()
    .mockImplementation(
      () =>
        'https://freshbucket.blob.core.windows.net/fresh-container/fresh-app/imma/66831fcd7708625e02c759e0_0_a0d66c36-4fa6-416b-a28f-1fa6e14f0bf0',
    ),
};
describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  const req = httpMock.createRequest({ user });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService() },
        { provide: AuthorizationGuard, useValue: mockAuthorizationGuard() },
        { provide: JWTService, useValue: mockJWTService() },
        // { provide: AzureBlobService, useValue: mockAzureStorage },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockPaginationData = {
    page: 0,
    limit: 0,
  };
  const userStub = UserStub();

  const mockFilterWithCreatedAt = {
    ...mockPaginationData,
    startDate: faker.date.betweens('2024-07-25')[0].toDateString(),
    endDate: faker.date.betweens('2024-07-26')[0].toDateString(),
  };

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const fetchUserStub = FindUserStub();

      (service.find as jest.Mock).mockResolvedValue(fetchUserStub);

      const result = await controller.findAll(mockPaginationData);
      expect(result).toEqual(fetchUserStub);
      expect(service.find).toHaveBeenCalledWith(mockPaginationData);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      (service.findOneById as jest.Mock).mockResolvedValue(userStub);

      const result = await controller.findOne(userStub._id);
      expect(result).toEqual(userStub);
      expect(service.findOneById).toHaveBeenCalledWith(
        new Types.ObjectId(userStub._id),
      );
    });
  });

  describe('findAllAdmin', () => {
    it('should return an array of all admins with pagination data', async () => {
      const fetchAdminStub = FindAdminStub();

      (service.findAllAdmin as jest.Mock).mockResolvedValue(fetchAdminStub);

      const result = await controller.findAllAdmin(mockPaginationData);
      expect(result).toEqual(fetchAdminStub);
      expect(service.findAllAdmin).toHaveBeenCalledWith(mockPaginationData);
    });
  });

  describe('update', () => {
    it('should return a user if found', async () => {
      const firstName = faker.person.firstName();
      const user = { ...userStub, firstName };
      const email = user.email.address;

      const message = { message: 'update successful' };
      req['user'] = { userId: userStub._id };

      (service.updateOne as jest.Mock).mockResolvedValue(message);

      const result = await controller.update({ firstName, email }, req);
      expect(result).toEqual(message);
      expect(service.updateOne).toHaveBeenCalledWith(user._id, {
        firstName,
      });
    });
  });

  describe('updateUserDevice', () => {
    it('should update a user device', async () => {
      const message = { message: 'update successful' };
      req['user'] = { userId: userStub._id };

      (service.updateUserDevice as jest.Mock).mockResolvedValue(message);

      const result = await controller.updateUserDevice(UserDeviceStub(), req);

      expect(result).toEqual(message);

      expect(service.updateUserDevice).toHaveBeenCalledWith(
        userStub._id,
        UserDeviceStub(),
      );
    });
  });

  describe('countUsers', () => {
    it('should return the total users and new users', async () => {
      (service.countUsers as jest.Mock).mockResolvedValue(CountUserDtoStub());

      const result = await controller.countUsers();

      expect(result).toEqual(CountUserDtoStub());

      expect(service.countUsers).toHaveBeenCalled();
    });
  });

  describe('filterUsersWithCreatedAt', () => {
    it('should return filtered users', async () => {
      const findUser = FindUserStub();

      (service.findWithCreatedAt as jest.Mock).mockResolvedValue(findUser);

      const result = await controller.filterUsersWithCreatedAt(
        mockFilterWithCreatedAt,
      );

      expect(result).toEqual(findUser);

      expect(service.findWithCreatedAt).toHaveBeenCalledWith(
        mockFilterWithCreatedAt,
      );
    });
  });

  describe('banUserAccount', () => {
    it('should ban a single users', async () => {
      const findUser = FindUserStub();

      (service.banUserAccount as jest.Mock).mockResolvedValue(userStub);

      const result = await controller.banUserAccount(userStub._id);

      expect(result).toEqual(userStub);

      expect(service.banUserAccount).toHaveBeenCalledWith(userStub._id);
    });
  });

  describe('banMultipleUsers', () => {
    it('should ban multiple users', async () => {
      const findUser = FindUserStub();

      (service.banMultipleUserAccounts as jest.Mock).mockResolvedValue({
        bannedUsers: true,
      });

      const result = await controller.banMultipleUsers({
        usersId: [userStub._id],
      });

      expect(result).toEqual({
        bannedUsers: true,
      });

      expect(service.banMultipleUserAccounts).toHaveBeenCalledWith([
        userStub._id,
      ]);
    });
  });

  describe('delete', () => {
    it('should delete a user and return the deleted user', async () => {
      const id = new Types.ObjectId();
      const user = { _id: id } as UserDocument;
      (service.deleteOne as jest.Mock).mockResolvedValue(user);

      const result = await controller.delete(id.toHexString());
      expect(result).toEqual(user);
      expect(service.deleteOne).toHaveBeenCalledWith(id);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple users', async () => {
      const ids = [
        new Types.ObjectId().toHexString(),
        new Types.ObjectId().toHexString(),
      ];
      (service.deleteMany as jest.Mock).mockResolvedValue(null);

      await controller.deleteMany(ids);
      expect(service.deleteMany).toHaveBeenCalledWith(
        ids.map((id) => new Types.ObjectId(id)),
      );
    });
  });
});
