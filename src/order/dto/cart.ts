import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '../schemas/cart.schema';
import { Types } from 'mongoose';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

class CartAttribute {
  key: string;
  value: string;
}

class BrandingInfo {
  type: 'PRINT' | 'ENGRAVE' | 'TRANSFER';
  artwork: 'MULTI' | 'SINGLE';
  position: 'ONE' | 'TWO';
}
export class AddCartItemDto {
  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  @IsString()
  userId: Types.ObjectId;

  @ApiProperty({
    type: 'string',
    example: '1a239e24bd1b90d4257a',
  })
  @IsString()
  productId: Types.ObjectId;

  @ApiProperty({
    type: 'number',
    example: 5,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    type: 'number',
    example: 10.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    type: 'number',
    example: [
      {
        key: 'color',
        value: 'red',
      },
      {
        key: 'snaphook',
        value: 'red',
      },
      {
        key: 'color',
        value: 'red',
      },
    ],
  })
  @IsArray()
  attributes?: CartAttribute[];

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  isCheckedOut?: boolean;

  @ApiProperty({
    type: 'object',
    example: {
      type: 'PRINT',
      artwork: 'MULTI',
      position: 'ONE',
    },
  })
  @IsObject()
  brandingInfo?: BrandingInfo;
}

export class UpdateCartItemDto extends Cart {
  @ApiProperty({ example: '66acca030eb6332b901a83fb' })
  id?: string;
}
