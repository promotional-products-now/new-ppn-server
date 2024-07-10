import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserService } from './user.service';
import { UserDocument } from './schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

const mockBlock = {
  blocker: new Types.ObjectId(),
  blocked: new Types.ObjectId(),
};

const mockUserModel = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
});

const mockBlockModel = {
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue(mockBlock),
  findOneAndDelete: jest.fn().mockResolvedValue(mockBlock),
  find: jest.fn().mockImplementation(() => ({
    populate: () => [mockBlock],
  })),
};

describe('UserService', () => {
  let service: UserService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken('User'), useValue: mockUserModel() },
        { provide: getModelToken('UserDevice'), useValue: mockUserModel() },
        { provide: getModelToken('Block'), useValue: mockBlockModel },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const payload = { userName: 'testUser' };
      const createdUser = { _id: '1', userName: 'testUser' };
      (model.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(payload);
      expect(result).toEqual(createdUser);
      expect(model.create).toHaveBeenCalledWith(payload);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const userName = 'testUser';
      const user = { _id: '1', userName: 'testUser' };
      (model.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne(userName);
      expect(result).toEqual(user);
      expect(model.findOne).toHaveBeenCalledWith({ userName });
    });

    it('should throw NotFoundException if user not found', async () => {
      (model.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistentUser')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const user = { _id: '1', email: { address: email } };
      (model.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOneByEmail(email);
      expect(result).toEqual(user);
      expect(model.findOne).toHaveBeenCalledWith({ 'email.address': email });
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const id = new Types.ObjectId();
      const user = { _id: id } as UserDocument;
      (model.findById as jest.Mock).mockResolvedValue(user);

      const result = await service.findOneById(id);
      expect(result).toEqual(user);
      expect(model.findById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if user not found', async () => {
      (model.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.findOneById(new Types.ObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('find', () => {
    it('should return an array of users', async () => {
      const users = [{ _id: '1' }, { _id: '2' }] as UserDocument[];
      (model.find as jest.Mock).mockResolvedValue(users);

      const result = await service.find();
      expect(result).toEqual(users);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('updateOne', () => {
    it('should update a user', async () => {
      const id = new Types.ObjectId();
      const updateData = { userName: 'updatedUser' };
      (model.updateOne as jest.Mock).mockResolvedValue({ modified: 1 });

      await service.updateOne(id, updateData);
      expect(model.updateOne).toHaveBeenCalledWith({ _id: id }, updateData, {
        lean: true,
      });
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple users', async () => {
      const ids = [new Types.ObjectId(), new Types.ObjectId()];
      (model.deleteMany as jest.Mock).mockResolvedValue(null);

      await service.deleteMany(ids);
      expect(model.deleteMany).toHaveBeenCalledWith({ _id: { $in: ids } });
    });
  });

  describe('setRefreshToken', () => {
    it('should set refresh token', async () => {
      const userId = new Types.ObjectId();
      const refreshToken = 'refreshToken';
      (model.updateOne as jest.Mock).mockResolvedValue(null);

      await service.setRefreshToken(userId, refreshToken);
      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { refreshToken },
      );
    });
  });
});
