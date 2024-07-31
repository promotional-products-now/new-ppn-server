import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../types';
import { Supplier } from '../schemas/supplier.schema';
import { Product } from '../schemas/product.schema';

class SupplierExtended extends Supplier {
  totalaProducts: number;
}

export class PaginatedSupplierResponse extends PaginatedResponseDto<Supplier> {
  @ApiProperty({ type: [SupplierExtended] })
  docs: SupplierExtended[];
}

export class PaginatedProductResponse extends PaginatedResponseDto<Product> {}
