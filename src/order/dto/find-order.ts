import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { STATUS_ENUM } from '../../order/order.contants';
import { Types } from 'mongoose';

export class FindOrderDto {
  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 15 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  limit: number = 15;

  @ApiProperty({ example: 'status', required: false })
  @IsString()
  @IsOptional()
  status?: STATUS_ENUM;

  @ApiProperty({ example: 'optional userid to filter by', required: false })
  @IsString()
  @IsOptional()
  userId?: string | Types.ObjectId;

  /**
   * You can find find all orders a product has
   */
  @ApiProperty({ example: 'optional productid to filter by', required: false })
  @IsString()
  @IsOptional()
  productId?: string;
}
