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
  IsString,
  Matches,
  ValidateNested,
  IsOptional,
  IsArray,
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

class AdvancedMarkupTier {
  @ApiProperty({ type: Number, description: 'Profit markup percentage' })
  profitMarkup: number;

  @ApiProperty({ type: Date, description: 'Expiry date for the markup' })
  markupExpiryDate: Date;

  @ApiProperty({ type: String, description: 'Sales pitch for this tier' })
  salesPitch: string;
}

export class AdvancedMarkup {
  @ApiProperty({ type: AdvancedMarkupTier, description: 'Regular tier markup' })
  @ValidateNested()
  @Type(() => AdvancedMarkupTier)
  regular: AdvancedMarkupTier;

  @ApiProperty({ type: AdvancedMarkupTier, description: 'Gold tier markup' })
  @ValidateNested()
  @Type(() => AdvancedMarkupTier)
  gold: AdvancedMarkupTier;

  @ApiProperty({ type: AdvancedMarkupTier, description: 'Diamond tier markup' })
  @ValidateNested()
  @Type(() => AdvancedMarkupTier)
  diamond: AdvancedMarkupTier;
}

export class UpdateProductDto extends BaseUpdateDto {
  @ApiProperty({
    type: Discounts,
    description: 'Discounts applied to the product',
  })
  @ValidateNested()
  @Type(() => Discounts)
  discounts: Discounts;

  @ApiProperty({
    type: AdvancedMarkup,
    description: 'Advanced markup settings for different tiers',
  })
  @ValidateNested()
  @Type(() => AdvancedMarkup)
  @IsOptional()
  advancedMarkup?: AdvancedMarkup;
}

export class MultiUpdateProductDto {
  @ApiProperty({ type: Array<String>, description: 'An Array of product Ids' })
  ids: Array<string>;

  @ValidateNested()
  payload: UpdateProductDto;
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

export class ProductLabelDto {
  @ApiProperty({ required: true, example: 'some product id' })
  @IsString()
  productId: string;

  @ApiProperty({ required: true, example: 'best selling' })
  @Matches('^[a-z]+( [a-z]+)*$')
  label: string;
}

export class ProductLabelUpdateDto {
  @ApiProperty({ example: 'some product id' })
  @IsString({ message: 'Product ID is required' })
  productId: string;

  @ApiProperty({
    type: [String], // Correctly specifying an array of strings
    example: ['best selling'],
    isArray: true,
  })
  @IsArray({ message: 'Labels must be an array' })
  @IsString({ each: true, message: 'Each label must be a string' }) // Ensures each element in the array is a string
  labels: string[];
}

export class ProductUpdateDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  updated: boolean;
}
