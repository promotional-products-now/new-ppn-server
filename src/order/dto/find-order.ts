import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { STATUS_ENUM } from '../../order/order.contants';
import { ObjectId } from 'mongodb';

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

  @ApiProperty({ example: '669006e0915a7a315e11800f', required: false })
  @IsOptional()
  @Transform(({ value }) => new ObjectId(value))
  userId?: string;

  /**
   * You can find find all orders a product has
   */
  @ApiProperty({ example: 'optional productid to filter by', required: false })
  @IsString()
  @IsOptional()
  productId?: string;
}
