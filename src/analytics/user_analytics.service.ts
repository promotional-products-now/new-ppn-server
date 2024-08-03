import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import { AnalyticsDto } from './dto/analytics.dto';
import { UserRole } from '../user/enums/role.enum';
import { UserStatus } from '../user/enums/status.enum';

@Injectable()
export class UserAnalyticsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async userAnalytics(userAnalyticsDto: AnalyticsDto) {
    const startingDateTime = userAnalyticsDto.startDate
      ? new Date(userAnalyticsDto.startDate)
      : new Date('2024-01-01');

    startingDateTime.setHours(0, 0, 0, 0);

    const endingDateTime = userAnalyticsDto.endDate
      ? new Date(userAnalyticsDto.endDate)
      : new Date();

    endingDateTime.setHours(23, 59, 59, 999);

    const users = await this.userModel.find(
      {
        createdAt: { $gte: startingDateTime, $lte: endingDateTime },
        status: { $ne: UserStatus.DELETED },
        role: UserRole.USER,
      },
      { createdAt: 1, firstName: 1, lastName: 1 },
    );

    return users;
  }
}
