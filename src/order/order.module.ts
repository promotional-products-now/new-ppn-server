import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartService } from './cart.service';
import { JWTModule } from 'src/commons/services/JWTService/JWTService.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    JWTModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
  ],
  controllers: [OrderController, CartController],
  providers: [OrderService, CartService],
  exports: [OrderService, CartService],
})
export class OrderModule {}
