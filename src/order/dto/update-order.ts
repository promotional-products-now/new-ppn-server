import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order';

export class UpdateOrderDto extends CreateOrderDto {
  @ApiProperty({ example: '666d98ab565f924157e31c54' })
  declare id: string;
}
