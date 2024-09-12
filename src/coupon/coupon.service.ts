import { Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, CouponDocument } from './coupon.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as voucherCodes from 'voucher-code-generator';
import { ConfigService } from '@nestjs/config';
import { StripeConfig } from 'src/configs';
import Stripe from 'stripe';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponService {
  private stripe: Stripe;
  private stripeConfig: StripeConfig;

  constructor(
    private configService: ConfigService,

    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {
    this.stripeConfig = this.configService.get<StripeConfig>('stripe');
    this.stripe = new Stripe(this.stripeConfig.secretKey);
  }

  async create(inputs: Partial<CreateCouponDto>): Promise<Coupon> {
    const codes = voucherCodes.generate({
      prefix: 'PPN-',
      length: 4,
      count: 1,
    });

    const couponCode = codes[0];

    const coupon = await this.stripe.coupons.create({
      duration: 'forever',
      id: couponCode,
      percent_off: inputs.discount,
    });

    const createdCoupon = await this.couponModel.create({
      ...inputs,
      stripeId: coupon.id,
      code: couponCode,
    });

    return createdCoupon;
  }

  async findAll(): Promise<Coupon[]> {
    return await this.couponModel.find();
  }

  async checkCoupon(
    code: string,
    totalPrice: number,
    date = new Date(),
  ): Promise<{ discount: number; isExpired: boolean }> {
    const coupon = await this.couponModel.findOne({ code: code });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const isExpired = date > coupon.expiresAt;
    if (isExpired) {
      return { discount: 0, isExpired: true };
    }

    const discount = (totalPrice * coupon.discount) / 100;
    return { discount, isExpired: false };
  }

  async findOne(id: string): Promise<Coupon> {
    return await this.couponModel.findById(id);
  }

  async update(id: string, coupon: Coupon): Promise<Coupon> {
    return this.couponModel.findByIdAndUpdate(id, coupon, { new: true });
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.stripe.coupons.del(coupon.stripeId);

    await this.couponModel.findByIdAndDelete(id);
  }
}
