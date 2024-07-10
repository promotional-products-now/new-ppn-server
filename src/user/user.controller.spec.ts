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

const user = getUser({});

const mockUserService = () => ({
  find: jest.fn(),
  findOneById: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
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
        { provide: AzureBlobService, useValue: mockAzureStorage },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { _id: new Types.ObjectId() },
        { _id: new Types.ObjectId() },
      ] as UserDocument[];
      (service.find as jest.Mock).mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(service.find).toHaveBeenCalled();
    });
  });
  it('should return a user if found', async () => {
    const id = new Types.ObjectId();
    const user = { _id: id } as UserDocument;
    (service.findOneById as jest.Mock).mockResolvedValue(user);

    const result = await controller.findOne(id.toHexString());
    expect(result).toEqual(user);
    expect(service.findOneById).toHaveBeenCalledWith(id);
  });

  describe('findOneByUsername', () => {
    it('should return a user if found', async () => {
      const username = 'testUser';
      const user = { userName: username } as UserDocument;
      (service.findOne as jest.Mock).mockResolvedValue(user);

      const result = await controller.findOneByUsername(username);
      expect(result).toEqual(user);
      expect(service.findOne).toHaveBeenCalledWith(username);
    });
  });

  // describe('update', () => {
  //   it('should update a user', async () => {
  //     const id = new Types.ObjectId();
  //     const updateUserDto = { userName: 'updatedUser' };
  //     (service.updateOne as jest.Mock).mockResolvedValue(null);

  //     await controller.update(updateUserDto, {
  //       ...req,
  //       uid: id,
  //     });

  //     expect(service.updateOne).toHaveBeenCalledWith(id, {
  //       ...updateUserDto,
  //       email: req.user.email,
  //     });
  //   });
  // });

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
