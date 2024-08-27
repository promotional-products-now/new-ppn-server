import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FilterProductQueryDto {
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  colours: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  filter: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  vendors: string[];

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiPropertyOptional({ example: 15 })
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({ example: 'football boots' })
  @IsString()
  @IsOptional()
  subCategory: string;

  @ApiPropertyOptional({ example: 'footwears' })
  @IsString()
  @IsOptional()
  category: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isAdmin: boolean;
}

export class FilterPage {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiPropertyOptional({ example: 15 })
  @Type(() => Number)
  @Transform(({ value }) => Number({ value }))
  @IsNumber()
  @IsOptional()
  limit: number;
}

export class FilterProductByCategoryQueryDto extends FilterPage {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort: string;
}

export class FilterShowCaseQueryDto extends FilterPage {
  @ApiPropertyOptional({ example: 'footwears' })
  @IsString()
  @IsOptional()
  categories: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isAdmin: boolean;
}

export class TopSellingProductQuery extends FilterPage {}
