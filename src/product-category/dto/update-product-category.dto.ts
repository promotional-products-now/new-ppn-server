import { PartialType } from '@nestjs/swagger';
import { BaseUpdateDto } from '../../product/dto/update-product.dto';
import { CreateProductCategoryDto } from './create-product-category.dto';
export class UpdateCategoryDto extends BaseUpdateDto {}

export class UpdateSubCategoryDto extends BaseUpdateDto {}

export class UpdateProductCategoryDto extends PartialType(
  CreateProductCategoryDto,
) {}
