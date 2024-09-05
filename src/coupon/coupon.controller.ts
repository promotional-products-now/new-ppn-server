import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Get()
  @ApiOperation({ summary: 'finds all coupons' })
  // TODO: implement me
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(@Query() query: any) {
    return await this.couponService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'gets a coupon by id' })
  async getOrderById(@Param('id') id: string) {
    return await this.couponService.findOne(id);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return await this.couponService.remove(id);
  }
}
