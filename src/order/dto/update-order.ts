import { ApiProperty } from '@nestjs/swagger';
import { STATUS_ENUM } from '../order.contants';
import { IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({ example: '66acca030eb6332b901a83fb' })
  id?: string;

  @ApiProperty({
    type: 'string',
    enum: STATUS_ENUM,
    example: STATUS_ENUM.CANCELLED,
  })
  @IsEnum(STATUS_ENUM)
  status: string;
}
