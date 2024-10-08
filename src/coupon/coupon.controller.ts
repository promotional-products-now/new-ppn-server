import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { AuthorizationGuard } from 'src/commons/guards/authorization.guard';

@ApiTags('coupon')
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

  @UseGuards(AuthorizationGuard)
  @ApiSecurity('uid')
  @ApiBearerAuth()
  @Post('/check')
  @ApiOperation({ summary: 'checks a coupon by code' })
  async checkCoupon(
    @Query('code') code: string,
    @Query('totalPrice') totalPrice: number,
    @Req() req,
  ) {
    const { userType } = req.user;

    return await this.couponService.checkCoupon(
      code,
      Number(totalPrice),
      userType,
    );
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

  @Post()
  @ApiOperation({ summary: 'creates a new coupon' })
  async createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return await this.couponService.create(createCouponDto);
  }
}
