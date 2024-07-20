import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserActivityDto } from './dto/create-user_activity.dto';
import { UpdateUserActivityDto } from './dto/update-user_activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserActivity,
  UserActivityDocument,
} from './schema/user_activity.schema';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectModel(UserActivity.name)
    private readonly userActivityModel: Model<UserActivityDocument>,
  ) {}
  async create(userId: string, createUserActivityDto: CreateUserActivityDto) {
    try {
      return await this.userActivityModel.create({
        ...createUserActivityDto,
        userId,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating user activity : ${error}`,
      );
    }
  }

  findAll() {
    return `This action returns all userActivity`;
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
