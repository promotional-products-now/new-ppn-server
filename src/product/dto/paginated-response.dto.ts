import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/types';
import { Supplier } from '../schemas/supplier.schema';
import { ProductCategory } from '../schemas/category.schema';
import { ProductSubCategory } from '../schemas/subCategory.schema';

export class PaginatedSupplierResponse implements PaginatedResponse<Supplier> {
  @ApiProperty({ type: [Supplier] })
  docs: Supplier[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class PaginatedCategoryResponse
  implements PaginatedResponse<ProductCategory>
{
  @ApiProperty({ type: [ProductCategory] })
  docs: ProductCategory[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class PaginatedSubCategoryResponse
  implements PaginatedResponse<ProductSubCategory>
{
  @ApiProperty({ type: [ProductSubCategory] })
  docs: ProductSubCategory[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}
