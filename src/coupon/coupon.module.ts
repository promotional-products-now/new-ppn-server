import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './coupon.schema';
import { CouponController } from './coupon.controller';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { JWTModule } from 'src/commons/services/JWTService/JWTService.module';
import {
  UserDevice,
  UserDeviceSchema,
} from 'src/user/schemas/userDevice.schema';
import { UserActivityModule } from 'src/user_activity/user_activity.module';

@Module({
  imports: [
    JWTModule,
    UserActivityModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: UserDevice.name, schema: UserDeviceSchema },
    ]),
  ],

  providers: [CouponService, UserService],
  exports: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
