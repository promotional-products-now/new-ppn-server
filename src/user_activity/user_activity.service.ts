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
  UserActivitySearchDto,
} from './dto/find_user_activity.dto';
import { PaginationDto } from '../commons/dtos/pagination.dto';
import { UserStatus } from '../user/enums/status.enum';
import { UserRole } from '../user/enums/role.enum';

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
      console.log({ error });
      throw new InternalServerErrorException(
        `Error creating user activity : ${error}`,
      );
    }
  }

  async filterActivityWithCreatedAt(filterDto: FilterWithCreatedAt) {
    try {
      let { page = 1, limit = 10, startDate, endDate } = filterDto;

      const startDateTime = startDate ? new Date(startDate) : new Date();

      startDateTime.setHours(0, 0, 0);

      const endDateTime = endDate ? new Date(endDate) : new Date();
      endDateTime.setHours(23, 59, 59, 999);

      if (!page || page <= 0) {
        page = 1;
      }
      if (!limit || limit <= 0) {
        limit = 10;
      }

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
          select: '_id firstName lastName email.address role',
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
      let { page = 1, limit = 10 } = paginationDto;

      if (!page || page <= 0) {
        page = 1;
      }
      if (!limit || limit <= 0) {
        limit = 10;
      }

      const skip = (page - 1) * limit;

      const result = await this.userActivityModel
        .aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          {
            $unwind: '$userDetails',
          },
          {
            $match: {
              'userDetails.role': { $ne: UserRole.USER },
            },
          },
          {
            $facet: {
              metadata: [{ $count: 'total' }],
              data: [
                {
                  $project: {
                    userId: 1,
                    activity: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    additionalData: 1,
                    'userDetails._id': 1,
                    'userDetails.firstName': 1,
                    'userDetails.lastName': 1,
                    'userDetails.email.address': 1,
                    'userDetails.role': 1,
                  },
                },
                { $skip: skip },
                { $limit: limit + 1 },
              ],
            },
          },
        ])
        .exec();

      const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
      const userActivities = result[0].data;

      const hasPrevious = skip === 0 ? false : true;
      const hasNext = userActivities.length > limit ? true : false;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (userActivities.length > limit) {
        userActivities.pop();
      }

      const activities = userActivities.map((userActivity: any) => {
        const {
          _id,
          userId,
          activity,
          additionalData,
          createdAt,
          updatedAt,
          userDetails,
        } = userActivity;

        return {
          activityId: _id.toString(),
          userId,
          user: userDetails,
          createdAt,
          activity,
          additionalData,
          updatedAt,
        };
      });

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

  async getOneUserActivity(userId: string, paginationDto: PaginationDto) {
    try {
      let { page = 1, limit = 10 } = paginationDto;

      if (!page || page <= 0) {
        page = 1;
      }
      if (!limit || limit <= 0) {
        limit = 10;
      }

      const skip = (page - 1) * limit;

      const userActivities = await this.userActivityModel
        .find({ userId: new ObjectId(userId) }, { password: 0, otpSecret: 0 })
        .skip(skip)
        .limit(limit + 1)
        .populate({
          path: 'userId',
          select: '_id firstName lastName email.address role',
        })
        .exec();

      const total = await this.userActivityModel.countDocuments({
        userId: new ObjectId(userId),
      });

      const hasPrevious = skip > 0;
      const hasNext = userActivities.length > limit;
      const nextPage = hasNext ? page + 1 : null;
      const prevPage = hasPrevious ? page - 1 : null;

      if (hasNext) {
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
      throw new InternalServerErrorException(
        'Error retrieving user activities',
        error.message,
      );
    }
  }

  async searchAndFilterActivityLogs(activitySearchDto: UserActivitySearchDto) {
    let {
      page = 1,
      limit = 10,
      searchTerm,
      startDate,
      endDate,
    } = activitySearchDto;

    if (!page || page <= 0) {
      page = 1;
    }
    if (!limit || limit <= 0) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    const startDateTime = startDate ? new Date(startDate) : new Date();

    startDateTime.setHours(0, 0, 0);

    const endDateTime = endDate ? new Date(endDate) : new Date();
    endDateTime.setHours(23, 59, 59, 999);

    const result = await this.userActivityModel
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    'userDetails.firstName': {
                      $regex: searchTerm,
                      $options: 'i',
                    },
                  },
                  {
                    'userDetails.lastName': {
                      $regex: searchTerm,
                      $options: 'i',
                    },
                  },
                ],
              },
              {
                createdAt: {
                  $gte: startDateTime,
                  $lte: endDateTime,
                },
              },
            ],
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $project: {
                  userId: 1,
                  activity: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  additionalData: 1,
                  'userDetails._id': 1,
                  'userDetails.firstName': 1,
                  'userDetails.lastName': 1,
                  'userDetails.email.address': 1,
                  'userDetails.role': 1,
                },
              },
              { $skip: skip },
              { $limit: limit + 1 },
            ],
          },
        },
      ])
      .exec();

    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const userActivities = result[0].data;

    const hasPrevious = skip > 0;
    const hasNext = userActivities.length > limit;
    const nextPage = hasNext ? page + 1 : null;
    const prevPage = hasPrevious ? page - 1 : null;

    if (hasNext) {
      userActivities.pop();
    }

    const activities = userActivities.map(
      //TODO:create proper type
      (userActivity: any) => {
        const { _id, userDetails, ...rest } = userActivity;

        return {
          activityId: _id.toString(),
          user: userDetails,
          ...rest,
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
  }

  remove(id: number) {
    return `This action removes a #${id} userActivity`;
  }
}
