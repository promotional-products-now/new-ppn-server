import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Suspend, SuspendDocument } from './schemas/suspend.schema';
import { CreateSuspendDto, UnSuspendDto } from './dto/create-suspend.dto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserStatus } from '../user/enums/status.enum';
import { UserActivityService } from '../user_activity/user_activity.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class SuspendService {
  constructor(
    @InjectModel(Suspend.name) private suspendModel: Model<SuspendDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly userActivityService: UserActivityService,
  ) {}

  async suspend(
    suspendedBy: string,
    createSuspendDto: CreateSuspendDto,
  ): Promise<{
    message: string;
  }> {
    const existingBan = await this.suspendModel.findOne({
      userId: new Types.ObjectId(createSuspendDto.userId),
    });

    if (existingBan) {
      return {
        message: 'user has been suspended',
      };
    }

    const createdSuspend = await this.suspendModel.create({
      ...createSuspendDto,
      suspendedBy: suspendedBy,
    });

    const user = await this.userModel.findByIdAndUpdate(
      createSuspendDto.userId,
      {
        status: UserStatus.SUSPENDED,
      },
    );

    await this.userActivityService.create(suspendedBy, {
      activity: `Suspended user ${user?.lastName}  ${user?.firstName}`,
      additionalData: { reason: createSuspendDto.reason },
    });

    await this.emailService.sendUserSuspendedEmail(
      [user.email.address],
      'Suspended',
      user.lastName,
      user.firstName,
      createSuspendDto.reason,
      user.phone,
    );
    return {
      message: 'user has been suspended',
    };
  }

  async unsuspend(
    unSuspendDto: UnSuspendDto,
    adminId: string,
  ): Promise<{
    user: UserDocument;
    message: string;
  }> {

    await this.suspendModel.deleteOne({
      userId: unSuspendDto.userId,
    });

    const user = await this.userModel.findByIdAndUpdate(unSuspendDto.userId, {
      status: UserStatus.ACTIVE,
    });

    await this.userActivityService.create(adminId, {
      activity: `Unsuspend user ${user?.lastName}  ${user?.firstName}`,
      additionalData: { reason: null },
    });

    await this.emailService.sendUserUnSuspendedEmail(
      [user.email.address],
      'Suspended',
      user.lastName,
      user.firstName,
      user.phone,
    );
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
