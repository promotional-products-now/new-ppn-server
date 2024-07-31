import { forwardRef, Module } from '@nestjs/common';
import { UserActivityService } from './user_activity.service';
import { UserActivityController } from './user_activity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserActivity,
  UserActivitySchema,
} from './schema/user_activity.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JWTModule,
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [UserActivityController],
  providers: [UserActivityService, AuthorizationGuard],
  exports: [UserActivityService],
})
export class UserActivityModule {}
