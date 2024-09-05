import { Injectable } from '@nestjs/common';
import { Coupon, CouponDocument } from './coupon.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as voucherCodes from 'voucher-code-generator';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {}

  async create(inputs: Partial<Coupon>): Promise<Coupon> {
    const codes = voucherCodes.generate({
      prefix: 'PPN-',
      length: 4,
      count: 1,
    });

    const createdCoupon = this.couponModel.create({
      ...inputs,
      code: codes[0],
    });
    return await createdCoupon;
  }

  async findAll(): Promise<Coupon[]> {
    return await this.couponModel.find();
  }

  async findOne(id: string): Promise<Coupon> {
    return await this.couponModel.findById(id);
  }

  async update(id: string, coupon: Coupon): Promise<Coupon> {
    return this.couponModel.findByIdAndUpdate(id, coupon, { new: true });
  }

  async remove(id: string): Promise<void> {
    await this.couponModel.findByIdAndDelete(id);
  }
}
