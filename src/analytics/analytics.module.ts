import { Module } from '@nestjs/common';
import { UserAnalyticsService } from './user_analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AnalyticsController],
  providers: [UserAnalyticsService],
})
export class AnalyticsModule {}
