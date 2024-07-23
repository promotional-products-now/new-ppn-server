import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateUserActivityDto,
  CreateUserActivityResDto,
} from './dto/create-user_activity.dto';
import { UpdateUserActivityDto } from './dto/update-user_activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserActivity,
  UserActivityDocument,
} from './schema/user_activity.schema';
import { ObjectId } from 'mongodb';
import {
  FilterWithCreatedAt,
  FindUserActivity,
} from './dto/find_user_activity.dto';
import { PaginationDto } from 'src/commons/dtos/pagination.dto';
import { UserStatus } from 'src/user/enums/status.enum';
import { UserRole } from 'src/user/enums/role.enum';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectModel(UserActivity.name)
    private readonly userActivityModel: Model<UserActivityDocument>,
  ) {}
  async create(
    userId: string,
    createUserActivityDto: CreateUserActivityDto,
  ): Promise<CreateUserActivityResDto> {
    try {
      const _id = new ObjectId();
      const userActivity = await this.userActivityModel.create({
        ...createUserActivityDto,
        userId: new ObjectId(userId),
        _id,
      });

      return { userActivityId: userActivity._id.toString() };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating user activity : ${error}`,
      );
    }
  }

  async filterActivityWithCreatedAt(filterDto: FilterWithCreatedAt) {
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

      const userActivities = await this.userActivityModel
        .find(
          {
            createdAt: { $gte: startDateTime, $lte: endDateTime },
          },
          { password: 0, otpSecret: 0 },
          { skip, limit: limit + 1 },
        )
        .populate({
          path: 'userId',
          select: '_id firstName lastName email.address',
        })
        .exec();

      const total = await this.userActivityModel.countDocuments();

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = userActivities.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (userActivities.length > limit) {
        userActivities.pop();
      }

      const activities = userActivities.map(
        (userActivity: UserActivityDocument) => {
          const {
            _id,
            userId,
            activity,
            additionalData,
            createdAt,
            updatedAt,
          } = userActivity;

          return {
            activityId: _id.toString(),
            user: userId,
            createdAt,
            activity,
            additionalData,
            updatedAt,
          };
        },
      );

      return {
        activities,
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

  async getAdminActivity(paginationDto: PaginationDto) {
    try {
      const data = paginationDto;

      const page = data.page ? data.page : 1;
      const limit = data.limit ? data.limit : 10;
      const skip = (page - 1) * limit;

      const userActivities = await this.userActivityModel
        .find(
          {
            role: { $ne: UserRole.USER },
          },
          { password: 0, otpSecret: 0 },
          { skip, limit: limit + 1 },
        )
        .populate({
          path: 'userId',
          select: '_id firstName lastName email.address',
        })
        .exec();

      const total = await this.userActivityModel.countDocuments();

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = userActivities.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (userActivities.length > limit) {
        userActivities.pop();
      }

      const activities = userActivities.map(
        (userActivity: UserActivityDocument) => {
          const {
            _id,
            userId,
            activity,
            additionalData,
            createdAt,
            updatedAt,
          } = userActivity;

          return {
            activityId: _id.toString(),
            user: userId,
            createdAt,
            activity,
            additionalData,
            updatedAt,
          };
        },
      );

      return {
        activities,
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

  findOne(id: number) {
    return `This action returns a #${id} userActivity`;
  }

  update(id: number, updateUserActivityDto: UpdateUserActivityDto) {
    return `This action updates a #${id} userActivity`;
  }

  remove(id: number) {
    return `This action removes a #${id} userActivity`;
  }
}
