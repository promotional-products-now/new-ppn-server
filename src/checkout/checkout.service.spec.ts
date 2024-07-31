import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { OrderModule } from '../order/order.module';
import { CheckoutController } from './checkout.controller';
import { User } from '../user/schemas/user.schema';
import { CheckoutInput } from './dto/checkout.dto';
import * as uuid from 'uuid';
import { JWTModule } from '../commons/services/JWTService/JWTService.module';

describe('BillingService', () => {
  let service: CheckoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrderModule, AppModule, JWTModule],
      providers: [CheckoutService, ConfigService],
      controllers: [CheckoutController],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a checkout url', async () => {
    const user = {
      email: {
        address: 'navi@gmail.com',
        isVerified: true,
      },
      _id: uuid.v4(),
    } as unknown as User;

    const items: CheckoutInput = {
      cartItems: [
        {
          description: 'a bag of chips',
          image: null,
          name: 'Chips',
          price: 10.99,
          quantity: 1,
          productId: uuid.v4(),
        },
        {
          description: 'tomates for the children',
          image: null,
          name: 'Tomates',
          price: 15.99,
          quantity: 10,
          productId: uuid.v4(),
        },
      ],
      orderDate: undefined,
      billingAddress: {
        city: 'Ubakala',
        state: 'Umuahia',
        country: 'Nigeria',
      },
      shippingAddress: {},
      paymentMethod: '',
    };

    const { url } = await service.processOrder(user, items);
    expect(url).toBeDefined();
  });
});
