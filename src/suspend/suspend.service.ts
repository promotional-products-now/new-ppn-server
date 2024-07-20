import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Suspend, SuspendDocument } from './schemas/suspend.schema';
import { CreateSuspendDto, UnSuspendDto } from './dto/create-suspend.dto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserStatus } from '../user/enums/status.enum';
import { UserActivityService } from 'src/user_activity/user_activity.service';

@Injectable()
export class SuspendService {
  constructor(
    @InjectModel(Suspend.name) private suspendModel: Model<SuspendDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly userActivityService: UserActivityService,
  ) {}

  async suspend(
    userId: string,
    createSuspendDto: CreateSuspendDto,
  ): Promise<{
    message: string;
  }> {
    const existingBan = await this.suspendModel.findOne({
      userId: createSuspendDto.userId,
    });

    if (existingBan) {
      return {
        message: 'user has been suspended',
      };
    }

    const createdSuspend = await this.suspendModel.create({
      ...createSuspendDto,
      suspendedBy: userId,
    });
    await this.userModel.findByIdAndUpdate(createSuspendDto.userId, {
      status: UserStatus.SUSPENDED,
    });

    await this.userActivityService.create(userId, {
      activity: 'suspend user',
      additionalData: { reason: createSuspendDto.reason },
    });
    return {
      message: 'user has been suspended',
    };
  }

  async unsuspend(unSuspendDto: UnSuspendDto): Promise<{
    user: UserDocument;
    message: string;
  }> {
    const result = await this.suspendModel.findByIdAndDelete({
      userId: unSuspendDto.userId,
    });

    if (!result) throw new NotFoundException('this user was never suspended');
    const user = await this.userModel.findByIdAndUpdate(unSuspendDto.userId, {
      status: UserStatus.ACTIVE,
    });

    return {
      user,
      message: 'user has been unsuspended',
    };
  }

  async findAll(): Promise<Suspend[]> {
    return await this.suspendModel.find();
  }

  async findByUserId(userId: string): Promise<Suspend> {
    return await this.suspendModel.findOne({ userId });
  }
}
