import { forwardRef, Module } from '@nestjs/common';
import { UserAnalyticsService } from './user_analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';
import { AuthorizationGuard } from '../commons/guards/authorization.guard';
import { UserModule } from '../user/user.module';
import { OrderAnalyticsService } from './order_analytics.service';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';

@Module({
  imports: [
    JWTModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [AnalyticsController],
  providers: [UserAnalyticsService, OrderAnalyticsService, AuthorizationGuard],
})
export class AnalyticsModule {}
