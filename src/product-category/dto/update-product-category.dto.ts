import { ApiProperty } from '@nestjs/swagger';
import { BaseUpdateDto } from '../../product/dto/update-product.dto';
import { IsArray } from 'class-validator';

export class UpdateCategoryDto extends BaseUpdateDto {}

export class UpdateSubCategoryDto extends BaseUpdateDto {}

export class UpdateCategoriesDto extends BaseUpdateDto {
  @ApiProperty({ type: 'string', isArray: true })
  @IsArray()
  ids: string[];
}

export class UpdateSubCategoriesDto extends BaseUpdateDto {
  @ApiProperty({ type: 'string', isArray: true })
  @IsArray()
  ids: string[];
}
