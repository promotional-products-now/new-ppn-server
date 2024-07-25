import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { OrderModule } from 'src/order/order.module';
import { CheckoutService } from './checkout.service';
import { ConfigService } from '@nestjs/config';
import { AppModule } from 'src/app.module';

describe('CheckoutController', () => {
  let controller: CheckoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrderModule, AppModule],
      providers: [CheckoutService, ConfigService],
      controllers: [CheckoutController],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
