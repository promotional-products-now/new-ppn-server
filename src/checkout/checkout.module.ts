import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { OrderModule } from '../order/order.module';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';

@Module({
  imports: [OrderModule, JWTModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
