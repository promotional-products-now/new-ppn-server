import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserService } from './user.service';
import { UserDocument } from './schemas/user.schema';
import { NotFoundException } from '@nestjs/common';
import { UserStub } from './user.stubs';
import { UserDeviceDocument } from './schemas/userDevice.schema';
import { UserActivityService } from '../user_activity/user_activity.service';
import { UserActivityDocument } from 'src/user_activity/schema/user_activity.schema';
import { faker } from '@faker-js/faker';

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
  countDocuments: jest.fn(),
});

const mockUserDeviceModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndDelete: jest.fn(),
  find: jest.fn(),
};

const mockUserActivityModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let model: Model<UserDocument>;
  let userDeviceModel: Model<UserDeviceDocument>;
  let userActivitiesModel: Model<UserActivityDocument>;

  const user = UserStub();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken('User'), useValue: mockUserModel() },
        { provide: getModelToken('UserDevice'), useValue: mockUserDeviceModel },
        UserActivityService,
        {
          provide: getModelToken('UserActivity'),
          useValue: mockUserActivityModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken('User'));
    userDeviceModel = module.get<Model<UserDeviceDocument>>(
      getModelToken('UserDevice'),
    );

    userActivitiesModel = module.get<Model<UserActivityDocument>>(
      getModelToken('UserActivity'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const payload = UserStub();
      (model.create as jest.Mock).mockResolvedValue(payload);

      const result = await service.create({
        ...payload,
        _id: new Types.ObjectId(payload._id),
      });

      expect({ ...result }).toEqual(payload);
      expect(model.create).toHaveBeenCalledWith({
        ...payload,
        _id: new Types.ObjectId(payload._id),
      });
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
      (model.find as jest.Mock).mockResolvedValue({
        users,
        hasNext: false,
        hasPrevious: false,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
      });

      jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(1);

      const result = await service.find({ page: 0, limit: 0 });
      expect(result).toEqual({
        users,
        hasNext: false,
        hasPrevious: false,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
      });
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('updateOne', () => {
    it('should update a user', async () => {
      const id = new Types.ObjectId(user._id);
      const updateData = { firstName: 'updatedUser' };
      (model.updateOne as jest.Mock).mockResolvedValue({ modified: 1 });

      (userActivitiesModel.create as jest.Mock).mockImplementation(
        (id, updateData) => {
          // userActivityId: faker.database.mongodbObjectId(),
        },
      );

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
