import { Module } from '@nestjs/common';
import { UserActivityService } from './user_activity.service';
import { UserActivityController } from './user_activity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserActivity,
  UserActivitySchema,
} from './schema/user_activity.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';

@Module({
  imports: [
    JWTModule,
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
    ]),
  ],
  controllers: [UserActivityController],
  providers: [UserActivityService],
  exports: [UserActivityService],
})
export class UserActivityModule {}
