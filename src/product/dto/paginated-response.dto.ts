import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse, PaginatedResponseDto } from 'src/types';
import { Supplier } from '../schemas/supplier.schema';
import { ProductCategory } from '../schemas/category.schema';
import { ProductSubCategory } from '../schemas/subCategory.schema';

export class PaginatedSupplierResponse extends PaginatedResponseDto<Supplier> {
  @ApiProperty({ type: [Supplier] })
  docs: Supplier[];
}

export class PaginatedCategoryResponse extends PaginatedResponseDto<ProductCategory> {
  @ApiProperty({ type: [ProductCategory] })
  docs: ProductCategory[];
}

export class PaginatedSubCategoryResponse extends PaginatedResponseDto<ProductSubCategory> {
  @ApiProperty({ type: [ProductSubCategory] })
  docs: ProductSubCategory[];
}
