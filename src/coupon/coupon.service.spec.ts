import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { Coupon, CouponSchema } from './coupon.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from 'src/app.module';

describe('CouponService', () => {
  let service: CouponService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forFeature([
          { name: Coupon.name, schema: CouponSchema },
        ]),
      ],

      providers: [CouponService],
    }).compile();

    service = module.get<CouponService>(CouponService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a coupon', async () => {
    const coupon: Partial<Coupon> = {
      name: 'testCoupon',
      description: 'coupon for laptop',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    };
    const result = await service.create(coupon);
    expect(result).toBeDefined();
  });

  it('should return an array of coupons', async () => {
    const result = await service.findAll();
    expect(result).toBeGreaterThan(0);
  });
});
