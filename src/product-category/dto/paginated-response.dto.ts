import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/types';
import { ProductCategory } from '../schemas/category.schema';
import { ProductSubCategory } from '../schemas/subCategory.schema';

export class PaginatedCategoryResponse extends PaginatedResponseDto<ProductCategory> {
  @ApiProperty({ type: [ProductCategory] })
  docs: ProductCategory[];
}

export class PaginatedSubCategoryResponse extends PaginatedResponseDto<ProductSubCategory> {
  @ApiProperty({ type: [ProductSubCategory] })
  docs: ProductSubCategory[];
}

export class ClientCategoryResponse {
  @ApiProperty({ example: 'Gifts' })
  name: string;
}
