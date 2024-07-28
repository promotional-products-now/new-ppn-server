import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../types';
import { Supplier } from '../schemas/supplier.schema';

export class PaginatedSupplierResponse extends PaginatedResponseDto<Supplier> {
  @ApiProperty({ type: [Supplier] })
  docs: Supplier[];
}
