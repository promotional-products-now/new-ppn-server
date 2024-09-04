import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { STATUS_ENUM } from '../product.interface';
import { Type } from 'class-transformer';
import { FilterProductQueryDto } from './filter-product-query.dto';

export class BaseUpdateDto {
  @ApiPropertyOptional({ type: 'boolean', example: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiPropertyOptional({ type: 'boolean', example: false })
  @IsBoolean()
  @IsOptional()
  isHot: boolean;

  @ApiPropertyOptional({
    type: 'string',
    enum: STATUS_ENUM,
    example: STATUS_ENUM.BUY_NOW,
  })
  @IsEnum(STATUS_ENUM)
  @IsOptional()
  status: STATUS_ENUM;
}

class DiscountRule {
  @ApiProperty({
    description: 'The total amount required to qualify for the discount',
    example: 100,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'The reduced markup amount due to the discount',
    example: 10,
  })
  @IsNumber()
  reducedMarkup: number;

  @ApiProperty({
    description: 'The expiry date of the discount',
    example: '2024-08-01T00:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  expiryDate: Date;
}

@ApiExtraModels(DiscountRule)
class Discounts {
  @ApiProperty({
    type: DiscountRule,
    description: 'The discount rules for the diamond tier',
  })
  @ValidateNested()
  @Type(() => DiscountRule)
  diamondRule: DiscountRule;

  @ApiProperty({
    type: DiscountRule,
    description: 'The discount rules for the gold tier',
  })
  @ValidateNested()
  @Type(() => DiscountRule)
  goldRule: DiscountRule;

  @ApiProperty({
    type: DiscountRule,
    description: 'The discount rules for the regular tier',
  })
  @ValidateNested()
  @Type(() => DiscountRule)
  regularRule: DiscountRule;
}

export class UpdateProductDto extends BaseUpdateDto {
  @ApiProperty({
    type: Discounts,
    description: 'Discounts applied to the product',
  })
  @ValidateNested()
  @Type(() => Discounts)
  discounts: Discounts;
}

export class UpdateCategoryDto extends BaseUpdateDto {}

export class UpdateSubCategoryDto extends BaseUpdateDto {}

export class UdpateSupplierDto extends BaseUpdateDto {}

export class FilterWithCreatedAt extends FilterProductQueryDto {
  @ApiProperty({ required: false, example: '2024-07-20' })
  @IsDateString()
  @IsOptional()
  startDate: string;

  @ApiProperty({ required: false, example: '2024-07-20' })
  @IsDateString()
  @IsOptional()
  endDate: string;
}
