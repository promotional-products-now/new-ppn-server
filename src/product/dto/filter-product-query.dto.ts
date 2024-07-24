import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

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
}

export class FilterProductByCategoryQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort: string;

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
