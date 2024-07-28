import { Module } from '@nestjs/common';
import { UserAnalyticsService } from './user_analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';

@Module({
  imports: [
    JWTModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AnalyticsController],
  providers: [UserAnalyticsService],
})
export class AnalyticsModule {}
