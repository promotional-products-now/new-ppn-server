import { Model, Types } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserSchema, UserDocument } from './schemas/user.schema';
import { DeleteResult, ObjectId } from 'mongodb';
import { UserDevice, UserDeviceDocument } from './schemas/userDevice.schema';
import { CreateUserDevice } from './dto/create-user.dto';
import { UserRole } from './enums/role.enum';
import { UserStatus } from './enums/status.enum';
import { PaginationDto } from '../commons/dtos/pagination.dto';
import { FilterWithCreatedAt, FindUsers } from './dto/fetch-user.dto';
import { DatabaseException } from '../commons/exceptions/database.exception';
import { BanMultipleUsers } from './dto/update-user.dto';
import { UserActivityService } from '../user_activity/user_activity.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserDevice.name)
    private readonly userDeviceModel: Model<UserDeviceDocument>,
    private readonly userActivityService: UserActivityService,
  ) {}

  async create(payload: Partial<UserDocument>): Promise<UserDocument> {
    try {
      return await this.userModel.create(payload);
    } catch (error) {
      throw new InternalServerErrorException(`Error creating user : ${error}`);
    }
  }

  async findOne(username: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ userName: username });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ 'email.address': email });
  }

  async findOneById(id: Types.ObjectId): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async find(paginationDto: PaginationDto): Promise<FindUsers> {
    try {
      const data = paginationDto;
      const page = data.page ? data.page : 1;
      const limit = data.limit ? data.limit : 10;
      const skip = (page - 1) * limit;

      const users = await this.userModel.find(
        { status: { $ne: UserStatus.DELETED }, role: UserRole.USER },
        { password: 0, otpSecret: 0 },
        { skip, limit: limit + 1 },
      );

      const total = await this.userModel.countDocuments({
        status: { $ne: UserStatus.DELETED },
        role: UserRole.USER,
      });

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = users.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (users.length > limit) {
        users.pop();
      }
      return {
        users,
        hasPrevious,
        hasNext,
        nextPage,
        prevPage,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users', error);
    }
  }

  async findAllAdmin(paginationDto: PaginationDto): Promise<FindUsers> {
    try {
      const data = paginationDto;
      const page = data.page ? data.page : 1;
      const limit = data.limit ? data.limit : 10;
      const skip = (page - 1) * limit;

      const users = await this.userModel.find(
        { status: { $ne: UserStatus.DELETED }, role: { $ne: UserRole.USER } },
        { password: 0, otpSecret: 0 },
        { skip, limit: limit + 1 },
      );

      const total = await this.userModel.countDocuments();

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = users.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (users.length > limit) {
        users.pop();
      }
      return {
        users,
        hasPrevious,
        hasNext,
        nextPage,
        prevPage,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users', error);
    }
  }

  async findUserByEmailOrUsername({
    email,
    userName,
  }: {
    email: string;
    userName: string;
  }) {
    const user = await this.userModel.findOne({
      $or: [{ 'email.address': email }, { userName: userName }],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findOneAndUpdate(email: string, data: unknown): Promise<UserDocument> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { 'email.address': email },
      data,
      {
        lean: true,
        new: true,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return updatedUser;
  }

  async updateOne(
    id: Types.ObjectId,
    updateData: Partial<UserDocument>,
    createActivity: boolean = true,
  ): Promise<any> {
    const result = await this.userModel.updateOne({ _id: id }, updateData, {
      lean: true,
    });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (createActivity) {
      await this.userActivityService.create(id.toString(), {
        activity: 'update account',
        additionalData: { ...updateData },
      });
    }
    return { message: 'update successful' };
  }

  async updateOneByEmail(
    email: string,
    updateData: Partial<UserDocument>,
  ): Promise<any> {
    const result = await this.userModel.updateOne(
      { 'email.address': email },
      updateData,
      { lean: true },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return { message: 'update successful' };
  }

  async updateUserDevice(
    userId: string,
    newDevice: CreateUserDevice,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.userDevice) {
      const device = await this.userDeviceModel.create({
        owner: user._id,
        ...newDevice,
      });
      this.updateOne(user._id, { userDevice: device._id });
      return { message: 'update successful' };
    }

    await this.userDeviceModel.updateOne({ _id: user.userDevice }, newDevice);

    return { message: 'update successful' };
  }

  async deleteOne(id: Types.ObjectId): Promise<UserDocument> {
    try {
      const user = await this.findOneById(id);
      await this.userModel.updateOne(
        { _id: id },
        { $set: { status: UserStatus.DELETED } },
      );

      await this.userActivityService.create(user._id.toString(), {
        activity: 'delete user',
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async deleteMany(ids: Types.ObjectId[]): Promise<DeleteResult> {
    try {
      const result = await this.userModel.deleteMany(
        { _id: { $in: ids } },
        { $set: { status: UserStatus.DELETED } },
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting multiple users');
    }
  }

  async setRefreshToken(
    userId: Types.ObjectId,
    refreshToken: string,
  ): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { refreshToken });
  }

  async countUsers() {
    const date = new Date();

    const startDateTime = date.setHours(0, 0, 0);
    const endDateTime = date.setHours(23, 59, 59, 999);

    const totalUsers = await this.userModel.countDocuments({
      status: { $ne: UserStatus.DELETED },
      role: UserRole.USER,
    });
    const newUsers = await this.userModel.countDocuments({
      createdAt: { $gte: startDateTime, $lte: endDateTime },
      status: { $ne: UserStatus.DELETED },
      role: UserRole.USER,
    });

    return { totalUsers, newUsers };
  }

  async findWithCreatedAt(filterDto: FilterWithCreatedAt): Promise<FindUsers> {
    try {
      const data = filterDto;

      const startDateTime = data.startDate
        ? new Date(data.startDate)
        : new Date();

      startDateTime.setHours(0, 0, 0);

      const endDateTime = data.endDate ? new Date(data.endDate) : new Date();
      endDateTime.setHours(23, 59, 59, 999);

      const page = data.page ? data.page : 1;
      const limit = data.limit ? data.limit : 10;
      const skip = (page - 1) * limit;

      const users = await this.userModel.find(
        {
          status: { $ne: UserStatus.DELETED },
          role: UserRole.USER,
          createdAt: { $gte: startDateTime, $lte: endDateTime },
        },
        { password: 0, otpSecret: 0 },
        { skip, limit: limit + 1 },
      );

      const total = await this.userModel.countDocuments();

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = users.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (users.length > limit) {
        users.pop();
      }
      return {
        users,
        hasPrevious,
        hasNext,
        nextPage,
        prevPage,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users', error);
    }
  }

  async banUserAccount(userId: string): Promise<UserDocument> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { status: UserStatus.BANNED } },
      {
        lean: true,
        new: true,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return updatedUser;
  }

  async banMultipleUserAccounts(userIds: string[]): Promise<BanMultipleUsers> {
    const filter = {
      _id: { $in: userIds.map((userId) => new ObjectId(userId)) },
    };

    const { modifiedCount } = await this.userModel.updateMany(
      filter,
      { $set: { status: UserStatus.BANNED } },
      {
        lean: true,
        new: true,
      },
    );

    if (modifiedCount < 1) {
      throw new DatabaseException(`The operation could not be performed`);
    }

    const bannedUsers = modifiedCount === userIds.length;
    return { bannedUsers };
  }

  async logOutUser(userId: string) {
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userId),
    });

    await this.userModel.updateOne(
      new Types.ObjectId(userId),
      {
        tokenVersion: user.tokenVersion + 1,
      },
      { upsert: false },
    );

    return { message: 'Logout successful' };
  }
}
