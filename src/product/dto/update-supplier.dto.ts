import { IsArray } from 'class-validator';
import { BaseUpdateDto } from './update-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UdpateSupplierDto extends BaseUpdateDto {}

export class UdpateSuppliersDto extends BaseUpdateDto {
  @ApiProperty({ type: 'string', isArray: true })
  @IsArray()
  ids: string[];
}
