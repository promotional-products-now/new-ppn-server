import { ApiProperty } from '@nestjs/swagger';
import { STATUS_ENUM } from '../../order/order.contants';

export class CreateOrderDto {
  @ApiProperty({
    type: 'string',
    enum: STATUS_ENUM,
    example: STATUS_ENUM.CANCELLED,
  })
  status: string;

  @ApiProperty({ type: 'string', example: '666d98ab565f924157e31c54' })
  userId: string;

  @ApiProperty({ type: 'number', example: 100.99 })
  totalAmount: number;

  @ApiProperty({
    type: [{ productId: 'string', quantity: 'number' }],
    example: [
      { productId: '666d98ab565f924157e31c54', quantity: 4, price: 4.99 },
    ],
  })
  cartItems: { productId: string; quantity: number; price: number }[];
}
