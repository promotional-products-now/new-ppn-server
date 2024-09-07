import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './coupon.schema';
import { CouponController } from './coupon.controller';

@Module({
  providers: [CouponService],
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  exports: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
