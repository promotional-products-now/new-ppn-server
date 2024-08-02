import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { ConfigService } from '@nestjs/config';
import { AppModule } from 'src/app.module';
import { OrderModule } from 'src/order/order.module';
import { CheckoutController } from './checkout.controller';
import { User } from 'src/user/schemas/user.schema';
import { CheckoutInput } from './dto/checkout.dto';
import { JWTModule } from 'src/commons/services/JWTService/JWTService.module';
import { forwardRef } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { ObjectId } from 'mongodb';
import { ProductModule } from 'src/product/product.module';
import { ProductService } from 'src/product/product.service';

describe('BillingService', () => {
  let service: CheckoutService;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ProductModule,
        OrderModule,
        AppModule,
        JWTModule,
        forwardRef(() => UserModule),
      ],
      providers: [CheckoutService, ConfigService],
      controllers: [CheckoutController],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    productService = module.get<ProductService>(ProductService);
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
      _id: new ObjectId('66434fbad54cecbd2569b403'),
    } as unknown as User;

    const productsRes = await productService.findAll({
      limit: 10,
      colours: [],
      search: '',
      sort: '',
      filter: [],
      vendors: [],
      page: 0,
    });

    const products = productsRes.docs.map((product) => product).slice(0, 5);

    const cartItems = products.map((product) => {
      const q = Math.floor(Math.random() * 10) + 1;
      return {
        productId: product._id,
        quantity: q,
        price: product.price || 13.99,
        name: 'Chips',
        description: 'tomates for the children',
      };
    });

    const items: CheckoutInput = {
      cartItems: cartItems,
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
