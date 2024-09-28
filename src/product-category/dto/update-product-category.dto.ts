import { ApiProperty } from '@nestjs/swagger';
import {
  AdvancedMarkup,
  BaseUpdateDto,
} from '../../product/dto/update-product.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto extends BaseUpdateDto {
  @ValidateNested()
  @Type(() => AdvancedMarkup)
  @IsOptional()
  advancedMarkup?: AdvancedMarkup;
}

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
