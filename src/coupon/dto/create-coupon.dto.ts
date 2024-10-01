import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { UserType } from 'src/user/enums/userType.enum';

export class CreateCouponDto {
  @ApiProperty({
    type: Date,
    example: new Date().toISOString(),
    description: 'The expiration date of the coupon',
  })
  @IsDate()
  expiresAt: Date;

  @ApiProperty({
    type: 'number',
    description: 'Discount in percentage',
    example: 10,
  })
  @IsNumber()
  discount: number;

  @ApiProperty({
    type: 'string',
    example: 'testCoupon',
    description: 'The coupon name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: 'string',
    example: 'Coupon discount for laptop products',
    description: 'Coupon description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: UserType,
    description: 'different user tiers',
  })
  userType: UserType;
}
