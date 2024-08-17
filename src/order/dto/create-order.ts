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

  /**
   * ~ Update Sat Aug 17, 2024 ~
   * cart items are gotten from the database
   * so this field is optional by the client but required by the server
   */
  cartItems?: { productId: any; quantity: number; price: number }[];
}
