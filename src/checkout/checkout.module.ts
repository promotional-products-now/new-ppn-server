import { forwardRef, Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { OrderModule } from '../order/order.module';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { UserModule } from '../user/user.module';
import { CouponModule } from 'src/coupon/coupon.module';

@Module({
  imports: [OrderModule, JWTModule, forwardRef(() => UserModule), CouponModule],
  providers: [CheckoutService, AuthorizationGuard],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
