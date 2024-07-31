import { forwardRef, Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { OrderModule } from 'src/order/order.module';
import { JWTModule } from 'src/commons/services/JWTService/JWTService.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [OrderModule, JWTModule, forwardRef(() => UserModule)],
  providers: [CheckoutService, AuthorizationGuard],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
